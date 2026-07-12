import type { CitaCrearInput } from '@concesionario/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

// Datos del anuncio que acompañan a cada cita en las listas.
const VEHICULO_SELECT = {
  id: true,
  slug: true,
  anio: true,
  marca: { select: { nombre: true } },
  modelo: { select: { nombre: true } },
} as const;

@Injectable()
export class CitasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  /** Un comprador agenda una visita a un anuncio publicado ajeno. */
  async agendar(usuario: UsuarioAutenticado, input: CitaCrearInput) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: input.vehiculoId },
      select: {
        id: true,
        estado: true,
        anio: true,
        usuarioId: true,
        usuario: { select: { email: true } },
        marca: { select: { nombre: true } },
        modelo: { select: { nombre: true } },
      },
    });
    if (!vehiculo || vehiculo.estado !== 'publicado') {
      throw new NotFoundException('Anuncio no encontrado');
    }
    if (vehiculo.usuarioId === usuario.id) {
      throw new BadRequestException('No podés agendar una visita a tu propio anuncio');
    }

    // Una visita activa por comprador+anuncio; evita duplicados accidentales.
    const yaAgendada = await this.prisma.cita.findFirst({
      where: {
        vehiculoId: vehiculo.id,
        compradorId: usuario.id,
        estado: { in: ['pendiente', 'confirmada'] },
      },
      select: { id: true },
    });
    if (yaAgendada) {
      throw new BadRequestException('Ya tenés una visita agendada para este anuncio');
    }

    const cita = await this.prisma.cita.create({
      data: { vehiculoId: vehiculo.id, compradorId: usuario.id, fecha: input.fecha },
      select: { id: true, estado: true, fecha: true },
    });

    // Aviso al vendedor; best-effort, un fallo de cola no tumba el agendado.
    const anuncio = `${vehiculo.marca.nombre} ${vehiculo.modelo.nombre} ${vehiculo.anio}`;
    try {
      await this.notificaciones.nuevaCita(vehiculo.usuario.email, anuncio, this.fmt(cita.fecha));
    } catch {
      // la cita ya quedó persistida; la notificación es secundaria
    }

    return { id: cita.id, estado: cita.estado, fecha: cita.fecha };
  }

  /** Visitas que YO (comprador) solicité. */
  async mias(usuario: UsuarioAutenticado) {
    return this.prisma.cita.findMany({
      where: { compradorId: usuario.id },
      orderBy: { fecha: 'asc' },
      select: {
        id: true,
        fecha: true,
        estado: true,
        vehiculo: { select: VEHICULO_SELECT },
      },
    });
  }

  /** Visitas que recibí sobre MIS anuncios (vendedor). */
  async recibidas(usuario: UsuarioAutenticado) {
    return this.prisma.cita.findMany({
      where: { vehiculo: { usuarioId: usuario.id } },
      orderBy: { fecha: 'asc' },
      select: {
        id: true,
        fecha: true,
        estado: true,
        comprador: { select: { nombre: true } },
        vehiculo: { select: VEHICULO_SELECT },
      },
    });
  }

  /** El vendedor confirma una visita pendiente de uno de sus anuncios. */
  async confirmar(usuario: UsuarioAutenticado, id: number) {
    const cita = await this.cargar(id);
    if (cita.vehiculo.usuarioId !== usuario.id) {
      throw new NotFoundException('Visita no encontrada');
    }
    if (cita.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden confirmar visitas pendientes');
    }

    await this.prisma.cita.update({ where: { id }, data: { estado: 'confirmada' } });

    const anuncio = `${cita.vehiculo.marca.nombre} ${cita.vehiculo.modelo.nombre} ${cita.vehiculo.anio}`;
    try {
      await this.notificaciones.citaConfirmada(cita.comprador.email, anuncio, this.fmt(cita.fecha));
    } catch {
      // secundario
    }

    return { id, estado: 'confirmada' as const };
  }

  /** Cancela una visita: la puede cancelar el comprador que la pidió o el vendedor del anuncio. */
  async cancelar(usuario: UsuarioAutenticado, id: number) {
    const cita = await this.cargar(id);
    const esComprador = cita.compradorId === usuario.id;
    const esVendedor = cita.vehiculo.usuarioId === usuario.id;
    if (!esComprador && !esVendedor) {
      throw new NotFoundException('Visita no encontrada');
    }
    if (cita.estado === 'cancelada') {
      throw new BadRequestException('La visita ya está cancelada');
    }

    await this.prisma.cita.update({ where: { id }, data: { estado: 'cancelada' } });
    return { id, estado: 'cancelada' as const };
  }

  private async cargar(id: number) {
    const cita = await this.prisma.cita.findUnique({
      where: { id },
      select: {
        id: true,
        estado: true,
        fecha: true,
        compradorId: true,
        comprador: { select: { email: true } },
        vehiculo: {
          select: {
            usuarioId: true,
            anio: true,
            marca: { select: { nombre: true } },
            modelo: { select: { nombre: true } },
          },
        },
      },
    });
    if (!cita) {
      throw new NotFoundException('Visita no encontrada');
    }
    return cita;
  }

  private fmt(fecha: Date): string {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Guatemala',
    }).format(fecha);
  }
}
