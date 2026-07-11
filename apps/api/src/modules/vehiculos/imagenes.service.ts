import { randomUUID } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  IMAGEN_MIMES_PERMITIDOS,
  IMAGENES_POR_VEHICULO_MAX,
  type ImagenesReordenarInput,
} from '@concesionario/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { VehiculoImagen } from '@prisma/client';
import sharp from 'sharp';
import { env } from '../../config/env';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { ESTADOS_EDITABLES } from './maquina-estados';

// Dimensiones de salida: la principal para la ficha, el thumb para el listado.
const ANCHO_MAX = 1600;
const ANCHO_THUMB = 480;
const CALIDAD_FULL = 80;
const CALIDAD_THUMB = 70;

@Injectable()
export class ImagenesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Sube y procesa uno o más archivos, respetando el tope por anuncio. */
  async subir(usuario: UsuarioAutenticado, vehiculoId: number, archivos: Express.Multer.File[]) {
    if (!archivos || archivos.length === 0) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }
    await this.obtenerEditable(usuario, vehiculoId);

    const existentes = await this.prisma.vehiculoImagen.count({ where: { vehiculoId } });
    if (existentes + archivos.length > IMAGENES_POR_VEHICULO_MAX) {
      throw new BadRequestException(
        `Máximo ${IMAGENES_POR_VEHICULO_MAX} imágenes por anuncio (tenés ${existentes})`,
      );
    }
    for (const archivo of archivos) {
      if (!IMAGEN_MIMES_PERMITIDOS.includes(archivo.mimetype as never)) {
        throw new BadRequestException(`Formato no permitido: ${archivo.mimetype}`);
      }
    }

    const dir = join(env.UPLOAD_DIR, 'vehiculos', String(vehiculoId));
    await mkdir(dir, { recursive: true });

    // Procesamos a disco primero; si algo falla acá no tocamos la BD.
    const procesadas: { url: string; urlThumb: string; archivos: string[] }[] = [];
    try {
      for (const archivo of archivos) {
        procesadas.push(await this.procesar(archivo.buffer, vehiculoId, dir));
      }
    } catch {
      await Promise.all(
        procesadas.flatMap((p) => p.archivos.map((f) => rm(f, { force: true }))),
      ).catch(() => undefined);
      throw new BadRequestException('No se pudo procesar la imagen (¿archivo corrupto?)');
    }

    // La primera imagen de un anuncio sin fotos queda como principal.
    const hayPrincipal = existentes > 0;
    const maxOrden = await this.prisma.vehiculoImagen.aggregate({
      where: { vehiculoId },
      _max: { orden: true },
    });
    let orden = (maxOrden._max.orden ?? -1) + 1;

    await this.prisma.vehiculoImagen.createMany({
      data: procesadas.map((p, i) => ({
        vehiculoId,
        url: p.url,
        urlThumb: p.urlThumb,
        orden: orden++,
        esPrincipal: !hayPrincipal && i === 0,
      })),
    });

    return this.galeria(vehiculoId);
  }

  /** Borra una imagen; si era la principal, promueve la siguiente. */
  async eliminar(usuario: UsuarioAutenticado, vehiculoId: number, imagenId: number) {
    await this.obtenerEditable(usuario, vehiculoId);
    const imagen = await this.prisma.vehiculoImagen.findFirst({
      where: { id: imagenId, vehiculoId },
    });
    if (!imagen) {
      throw new NotFoundException('Imagen no encontrada');
    }

    await this.prisma.vehiculoImagen.delete({ where: { id: imagenId } });
    await this.borrarArchivos(imagen);

    if (imagen.esPrincipal) {
      const siguiente = await this.prisma.vehiculoImagen.findFirst({
        where: { vehiculoId },
        orderBy: { orden: 'asc' },
      });
      if (siguiente) {
        await this.prisma.vehiculoImagen.update({
          where: { id: siguiente.id },
          data: { esPrincipal: true },
        });
      }
    }

    return this.galeria(vehiculoId);
  }

  /** Reordena la galería; el primer id del arreglo queda como principal. */
  async reordenar(usuario: UsuarioAutenticado, vehiculoId: number, input: ImagenesReordenarInput) {
    await this.obtenerEditable(usuario, vehiculoId);
    const actuales = await this.prisma.vehiculoImagen.findMany({
      where: { vehiculoId },
      select: { id: true },
    });
    const idsActuales = new Set(actuales.map((i) => i.id));
    const idsPedidos = new Set(input.orden);
    if (idsActuales.size !== idsPedidos.size || input.orden.some((id) => !idsActuales.has(id))) {
      throw new BadRequestException('El orden debe incluir exactamente las imágenes del anuncio');
    }

    await this.prisma.$transaction(
      input.orden.map((id, i) =>
        this.prisma.vehiculoImagen.update({
          where: { id },
          data: { orden: i, esPrincipal: i === 0 },
        }),
      ),
    );

    return this.galeria(vehiculoId);
  }

  // ─────────────── Helpers ───────────────

  private galeria(vehiculoId: number) {
    return this.prisma.vehiculoImagen.findMany({
      where: { vehiculoId },
      orderBy: { orden: 'asc' },
    });
  }

  private async procesar(buffer: Buffer, vehiculoId: number, dir: string) {
    const nombre = randomUUID();
    const rutaFull = join(dir, `${nombre}.webp`);
    const rutaThumb = join(dir, `${nombre}-thumb.webp`);

    // rotate() aplica la orientación EXIF antes de redimensionar (fotos de celular).
    await Promise.all([
      sharp(buffer)
        .rotate()
        .resize({ width: ANCHO_MAX, withoutEnlargement: true })
        .webp({ quality: CALIDAD_FULL })
        .toFile(rutaFull),
      sharp(buffer)
        .rotate()
        .resize({ width: ANCHO_THUMB, withoutEnlargement: true })
        .webp({ quality: CALIDAD_THUMB })
        .toFile(rutaThumb),
    ]);

    const base = `${env.PUBLIC_URL}/uploads/vehiculos/${vehiculoId}`;
    return {
      url: `${base}/${nombre}.webp`,
      urlThumb: `${base}/${nombre}-thumb.webp`,
      archivos: [rutaFull, rutaThumb],
    };
  }

  private async borrarArchivos(imagen: VehiculoImagen) {
    // Reconstruimos la ruta local desde la URL pública (mismo prefijo).
    const rutas = [imagen.url, imagen.urlThumb]
      .filter((u): u is string => Boolean(u))
      .map((u) => join(env.UPLOAD_DIR, u.replace(`${env.PUBLIC_URL}/uploads/`, '')));
    await Promise.all(rutas.map((r) => rm(r, { force: true }))).catch(() => undefined);
  }

  /** Propiedad + estado editable: no se cambian fotos de un anuncio en revisión/publicado. */
  private async obtenerEditable(usuario: UsuarioAutenticado, vehiculoId: number) {
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
    if (!vehiculo) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    if (vehiculo.usuarioId !== usuario.id && usuario.rol !== 'admin') {
      throw new ForbiddenException('Este anuncio no es tuyo');
    }
    if (!ESTADOS_EDITABLES.includes(vehiculo.estado)) {
      throw new BadRequestException(
        `No se pueden cambiar fotos de un anuncio en estado "${vehiculo.estado}"; pausalo primero`,
      );
    }
    return vehiculo;
  }
}
