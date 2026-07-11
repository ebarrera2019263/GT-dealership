import { randomBytes } from 'node:crypto';
import type {
  VehiculoActualizarInput,
  VehiculoCrearInput,
  VehiculosFiltros,
} from '@concesionario/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Traccion, type Vehiculo } from '@prisma/client';
import { AuditoriaService } from '../../common/auditoria.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { type ActorTransicion, buscarTransicion, ESTADOS_EDITABLES } from './maquina-estados';

const DIAS_PUBLICACION = 60;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Campos que ve cualquiera. VIN y placa_parcial NUNCA entran acá (esquema §8).
const FICHA_PUBLICA_INCLUDE = {
  marca: { select: { id: true, nombre: true, slug: true } },
  modelo: { select: { id: true, nombre: true, slug: true } },
  carroceria: { select: { id: true, nombre: true, slug: true } },
  transmision: { select: { id: true, nombre: true } },
  combustible: { select: { id: true, nombre: true } },
  departamento: { select: { id: true, nombre: true } },
  municipio: { select: { id: true, nombre: true } },
  imagenes: { orderBy: { orden: 'asc' as const } },
  caracteristicas: { include: { caracteristica: true } },
} satisfies Prisma.VehiculoInclude;

const DATOS_PRIVADOS: (keyof Vehiculo)[] = ['vin', 'placaParcial'];

// El schema compartido habla '4x2'/'4x4'/'AWD'; el enum de Prisma usa T4X2/T4X4
// porque un identificador no puede empezar con número (el @map lo devuelve bien en la BD).
const MAPA_TRACCION: Record<string, Traccion> = {
  '4x2': Traccion.T4X2,
  '4x4': Traccion.T4X4,
  AWD: Traccion.AWD,
};

@Injectable()
export class VehiculosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ─────────────── Vendedor: CRUD con regla de propiedad ───────────────

  async crear(usuario: UsuarioAutenticado, input: VehiculoCrearInput) {
    const [modelo, precioGtq] = await Promise.all([
      this.prisma.modelo.findFirst({
        where: { id: input.modeloId, marcaId: input.marcaId, activo: true },
        include: { marca: true },
      }),
      this.aPrecioGtq(input.precio, input.moneda),
    ]);
    if (!modelo) {
      throw new BadRequestException('El modelo no pertenece a esa marca o no existe');
    }
    const municipio = await this.prisma.municipio.findFirst({
      where: { id: input.municipioId, departamentoId: input.departamentoId },
    });
    if (!municipio) {
      throw new BadRequestException('El municipio no pertenece a ese departamento');
    }

    const { caracteristicaIds, traccion, ...datos } = input;
    return this.prisma.vehiculo.create({
      data: {
        ...datos,
        traccion: traccion ? MAPA_TRACCION[traccion] : undefined,
        precioGtq,
        usuarioId: usuario.id,
        slug: this.generarSlug(modelo.marca.slug, modelo.slug, input.anio),
        caracteristicas: {
          create: caracteristicaIds.map((id) => ({ caracteristicaId: id })),
        },
      },
      include: FICHA_PUBLICA_INCLUDE,
    });
  }

  async actualizar(usuario: UsuarioAutenticado, id: number, input: VehiculoActualizarInput) {
    const vehiculo = await this.obtenerPropio(usuario, id);
    if (!ESTADOS_EDITABLES.includes(vehiculo.estado)) {
      throw new BadRequestException(
        `No se puede editar un anuncio en estado "${vehiculo.estado}"; pausalo primero`,
      );
    }

    const { caracteristicaIds, traccion, ...datos } = input;
    const precio = input.precio ?? Number(vehiculo.precio);
    const moneda = input.moneda ?? vehiculo.moneda;
    const precioGtq =
      input.precio !== undefined || input.moneda !== undefined
        ? await this.aPrecioGtq(precio, moneda)
        : undefined;

    const data: Prisma.VehiculoUncheckedUpdateInput = {
      ...datos,
      traccion: traccion ? MAPA_TRACCION[traccion] : undefined,
      precioGtq,
    };
    if (caracteristicaIds) {
      data.caracteristicas = {
        deleteMany: {},
        create: caracteristicaIds.map((cid) => ({ caracteristicaId: cid })),
      };
    }

    return this.prisma.vehiculo.update({
      where: { id },
      data,
      include: FICHA_PUBLICA_INCLUDE,
    });
  }

  /** Datos completos de un anuncio propio para precargar el formulario de edición.
   *  No expone VIN ni placa (esquema §8); esos no se editan desde el formulario. */
  async paraEdicion(usuario: UsuarioAutenticado, id: number) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        estado: true,
        usuarioId: true,
        marcaId: true,
        modeloId: true,
        carroceriaId: true,
        anio: true,
        version: true,
        precio: true,
        moneda: true,
        precioNegociable: true,
        kilometraje: true,
        transmisionId: true,
        combustibleId: true,
        cilindrada: true,
        potencia: true,
        puertas: true,
        color: true,
        traccion: true,
        numDuenos: true,
        descripcion: true,
        departamentoId: true,
        municipioId: true,
        caracteristicas: { select: { caracteristicaId: true } },
        imagenes: {
          orderBy: { orden: 'asc' as const },
          select: { id: true, url: true, urlThumb: true, esPrincipal: true },
        },
      },
    });
    if (!vehiculo) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    if (vehiculo.usuarioId !== usuario.id && usuario.rol !== 'admin') {
      throw new ForbiddenException('Este anuncio no es tuyo');
    }
    return vehiculo;
  }

  async misVehiculos(usuario: UsuarioAutenticado) {
    return this.prisma.vehiculo.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { actualizadoEn: 'desc' },
      include: {
        marca: { select: { nombre: true } },
        modelo: { select: { nombre: true } },
        imagenes: { where: { esPrincipal: true }, take: 1 },
      },
    });
  }

  // ─────────────── Transiciones de estado (auditadas) ───────────────

  async transicionar(
    usuario: UsuarioAutenticado,
    id: number,
    accion: string,
    opciones: { motivo?: string; ip?: string } = {},
  ) {
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException('Anuncio no encontrado');
    }

    const actor: ActorTransicion =
      usuario.rol === 'admin' ? 'admin' : vehiculo.usuarioId === usuario.id ? 'dueno' : 'sistema';
    if (actor === 'sistema') {
      throw new ForbiddenException('Este anuncio no es tuyo');
    }

    const transicion = buscarTransicion(vehiculo.estado, accion, actor);
    if (!transicion) {
      throw new BadRequestException(
        `Transición inválida: "${accion}" desde "${vehiculo.estado}" para tu rol`,
      );
    }

    const ahora = new Date();
    const datosPublicacion =
      transicion.hacia === 'publicado' && vehiculo.publicadoEn === null
        ? {
            publicadoEn: ahora,
            expiraEn: new Date(ahora.getTime() + DIAS_PUBLICACION * MS_POR_DIA),
          }
        : transicion.hacia === 'publicado' && vehiculo.estado === 'pausado'
          ? {} // reactivar no extiende la vigencia
          : {};

    // Transición + auditoría: todo o nada (esquema §4: toda transición se registra)
    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.vehiculo.update({
        where: { id },
        data: { estado: transicion.hacia, ...datosPublicacion },
      });
      await this.auditoria.registrar(
        {
          usuarioId: usuario.id,
          accion: `vehiculo.${accion}`,
          entidad: 'vehiculo',
          entidadId: id,
          datosAntes: { estado: vehiculo.estado },
          datosDespues: { estado: transicion.hacia, motivo: opciones.motivo ?? null },
          ip: opciones.ip,
        },
        tx,
      );
      return actualizado;
    });
  }

  // ─────────────── Público: listado, ficha, similares ───────────────

  async listar(filtros: VehiculosFiltros) {
    const where: Prisma.VehiculoWhereInput = {
      estado: 'publicado',
      marca: filtros.marca ? { slug: filtros.marca } : undefined,
      modelo: filtros.modelo ? { slug: filtros.modelo } : undefined,
      carroceria: filtros.carroceria ? { slug: filtros.carroceria } : undefined,
      anio: { gte: filtros.anioMin, lte: filtros.anioMax },
      precioGtq: { gte: filtros.precioMin, lte: filtros.precioMax },
      kilometraje: filtros.kmMax ? { lte: filtros.kmMax } : undefined,
      transmisionId: filtros.transmisionId,
      combustibleId: filtros.combustibleId,
      departamentoId: filtros.departamentoId,
    };

    const ordenes: Record<string, Prisma.VehiculoOrderByWithRelationInput[]> = {
      recientes: [{ destacado: 'desc' }, { publicadoEn: 'desc' }, { id: 'desc' }],
      precio_asc: [{ precioGtq: 'asc' }, { id: 'asc' }],
      precio_desc: [{ precioGtq: 'desc' }, { id: 'desc' }],
      km_asc: [{ kilometraje: 'asc' }, { id: 'asc' }],
      anio_desc: [{ anio: 'desc' }, { id: 'desc' }],
    };

    // Paginación por cursor sobre id (con orden determinista), nunca OFFSET
    const resultados = await this.prisma.vehiculo.findMany({
      where,
      orderBy: ordenes[filtros.orden],
      take: filtros.limite + 1,
      ...(filtros.cursor ? { cursor: { id: filtros.cursor }, skip: 1 } : {}),
      select: this.selectResumen(),
    });

    const hayMas = resultados.length > filtros.limite;
    const pagina = hayMas ? resultados.slice(0, filtros.limite) : resultados;
    return {
      resultados: pagina,
      siguienteCursor: hayMas ? pagina[pagina.length - 1]?.id : null,
    };
  }

  async fichaPorSlug(slug: string) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { slug },
      include: {
        ...FICHA_PUBLICA_INCLUDE,
        usuario: { select: { id: true, nombre: true, telefonoVerificado: true, creadoEn: true } },
      },
    });
    if (!vehiculo || vehiculo.estado !== 'publicado') {
      throw new NotFoundException('Anuncio no encontrado');
    }

    // Contador sin bloquear la respuesta; en Fase 2 pasa a un worker/Redis
    void this.prisma.vehiculo
      .update({ where: { id: vehiculo.id }, data: { vistas: { increment: 1 } } })
      .catch(() => undefined);

    return this.sinDatosPrivados(vehiculo);
  }

  async similares(id: number) {
    const base = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!base || base.estado !== 'publicado') {
      throw new NotFoundException('Anuncio no encontrado');
    }
    const margen = Number(base.precioGtq) * 0.3;
    return this.prisma.vehiculo.findMany({
      where: {
        estado: 'publicado',
        id: { not: id },
        OR: [
          { marcaId: base.marcaId, carroceriaId: base.carroceriaId },
          {
            carroceriaId: base.carroceriaId,
            precioGtq: {
              gte: Number(base.precioGtq) - margen,
              lte: Number(base.precioGtq) + margen,
            },
          },
        ],
      },
      orderBy: { publicadoEn: 'desc' },
      take: 6,
      select: this.selectResumen(),
    });
  }

  // ─────────────── Helpers ───────────────

  /** Regla de propiedad: el segundo nivel de autorización (esquema §8). */
  private async obtenerPropio(usuario: UsuarioAutenticado, id: number) {
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    if (vehiculo.usuarioId !== usuario.id && usuario.rol !== 'admin') {
      throw new ForbiddenException('Este anuncio no es tuyo');
    }
    return vehiculo;
  }

  /** Normaliza a GTQ con la tasa vigente: filtros y orden operan sobre precio_gtq. */
  private async aPrecioGtq(precio: number, moneda: string): Promise<Prisma.Decimal> {
    if (moneda === 'GTQ') {
      return new Prisma.Decimal(precio);
    }
    const tipoCambio = await this.prisma.tipoCambio.findFirst({
      orderBy: { vigenteDesde: 'desc' },
    });
    if (!tipoCambio) {
      throw new BadRequestException('No hay tipo de cambio configurado');
    }
    return new Prisma.Decimal(precio).mul(tipoCambio.tasaUsdGtq).toDecimalPlaces(2);
  }

  private generarSlug(marcaSlug: string, modeloSlug: string, anio: number): string {
    return `${marcaSlug}-${modeloSlug}-${anio}-${randomBytes(4).toString('hex')}`;
  }

  private selectResumen() {
    return {
      id: true,
      slug: true,
      anio: true,
      version: true,
      precio: true,
      moneda: true,
      precioGtq: true,
      kilometraje: true,
      destacado: true,
      verificado: true,
      publicadoEn: true,
      marca: { select: { nombre: true, slug: true } },
      modelo: { select: { nombre: true, slug: true } },
      carroceria: { select: { nombre: true } },
      transmision: { select: { nombre: true } },
      combustible: { select: { nombre: true } },
      departamento: { select: { nombre: true } },
      imagenes: { where: { esPrincipal: true }, take: 1, select: { urlThumb: true, url: true } },
    } satisfies Prisma.VehiculoSelect;
  }

  private sinDatosPrivados<T extends Record<string, unknown>>(
    vehiculo: T,
  ): Omit<T, 'vin' | 'placaParcial'> {
    const copia = { ...vehiculo };
    for (const campo of DATOS_PRIVADOS) {
      delete copia[campo as string];
    }
    return copia;
  }
}
