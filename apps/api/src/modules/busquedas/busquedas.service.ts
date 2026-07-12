import type {
  BusquedaActualizarInput,
  BusquedaCrearInput,
  CriteriosBusqueda,
} from '@concesionario/shared';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { VehiculosService } from '../vehiculos/vehiculos.service';

@Injectable()
export class BusquedasService {
  private readonly log = new Logger('AlertasBusqueda');

  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiculos: VehiculosService,
    private readonly notificaciones: NotificacionesService,
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

  // ─────────────── Alertas (cron diario) ───────────────

  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'alertas-busquedas' })
  async cronAlertas() {
    const r = await this.procesarAlertas();
    this.log.log(`Alertas: ${r.avisadas}/${r.revisadas} búsquedas con novedades`);
  }

  /**
   * Recorre las búsquedas con alerta activa, cuenta los anuncios publicados
   * desde la última notificación y, si hay novedades, encola un aviso y mueve
   * la marca de tiempo. Idempotente: correrlo dos veces no re-notifica lo mismo.
   */
  async procesarAlertas(): Promise<{ revisadas: number; avisadas: number }> {
    const busquedas = await this.prisma.busquedaGuardada.findMany({
      where: { alertaActiva: true },
      select: {
        id: true,
        criterios: true,
        ultimaNotificacion: true,
        usuario: { select: { email: true } },
      },
    });

    let avisadas = 0;
    for (const b of busquedas) {
      if (!b.ultimaNotificacion) continue; // sin línea base, no hay con qué comparar
      const criterios = b.criterios as CriteriosBusqueda;
      const novedades = await this.vehiculos.contar(criterios, b.ultimaNotificacion);
      if (novedades === 0) continue;

      try {
        await this.notificaciones.alertaBusqueda(
          b.usuario.email,
          this.resumen(criterios),
          novedades,
        );
      } catch (e) {
        this.log.warn(`No se pudo encolar alerta ${b.id}: ${e instanceof Error ? e.message : e}`);
      }
      await this.prisma.busquedaGuardada.update({
        where: { id: b.id },
        data: { ultimaNotificacion: new Date() },
      });
      avisadas++;
    }

    return { revisadas: busquedas.length, avisadas };
  }

  private resumen(criterios: CriteriosBusqueda): string {
    const partes = Object.entries(criterios)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${v}`);
    return partes.length > 0 ? partes.join(', ') : 'todos los vehículos';
  }
}
