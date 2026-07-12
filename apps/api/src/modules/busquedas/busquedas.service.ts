import type {
  BusquedaActualizarInput,
  BusquedaCrearInput,
  CriteriosBusqueda,
} from '@concesionario/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { VehiculosService } from '../vehiculos/vehiculos.service';

@Injectable()
export class BusquedasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiculos: VehiculosService,
  ) {}

  async crear(usuario: UsuarioAutenticado, input: BusquedaCrearInput) {
    const busqueda = await this.prisma.busquedaGuardada.create({
      data: {
        usuarioId: usuario.id,
        criterios: input.criterios as Prisma.InputJsonValue,
        ultimaNotificacion: new Date(),
      },
      select: { id: true },
    });
    return { id: busqueda.id };
  }

  /** Lista mis búsquedas con el conteo de novedades (anuncios nuevos desde la última vez). */
  async lista(usuario: UsuarioAutenticado) {
    const busquedas = await this.prisma.busquedaGuardada.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { id: 'desc' },
    });

    return Promise.all(
      busquedas.map(async (b) => {
        const criterios = b.criterios as CriteriosBusqueda;
        const [total, novedades] = await Promise.all([
          this.vehiculos.contar(criterios),
          b.ultimaNotificacion
            ? this.vehiculos.contar(criterios, b.ultimaNotificacion)
            : Promise.resolve(0),
        ]);
        return {
          id: b.id,
          criterios,
          alertaActiva: b.alertaActiva,
          total,
          novedades,
        };
      }),
    );
  }

  async actualizar(usuario: UsuarioAutenticado, id: number, input: BusquedaActualizarInput) {
    await this.propia(usuario, id);
    await this.prisma.busquedaGuardada.update({
      where: { id },
      data: { alertaActiva: input.alertaActiva },
    });
    return { id, alertaActiva: input.alertaActiva };
  }

  /** Marca las novedades como vistas (mueve la marca de tiempo a ahora). */
  async marcarVisto(usuario: UsuarioAutenticado, id: number) {
    await this.propia(usuario, id);
    await this.prisma.busquedaGuardada.update({
      where: { id },
      data: { ultimaNotificacion: new Date() },
    });
    return { id };
  }

  async eliminar(usuario: UsuarioAutenticado, id: number) {
    await this.propia(usuario, id);
    await this.prisma.busquedaGuardada.delete({ where: { id } });
    return { id };
  }

  private async propia(usuario: UsuarioAutenticado, id: number) {
    const b = await this.prisma.busquedaGuardada.findUnique({
      where: { id },
      select: { usuarioId: true },
    });
    if (!b || b.usuarioId !== usuario.id) {
      throw new NotFoundException('Búsqueda no encontrada');
    }
  }
}
