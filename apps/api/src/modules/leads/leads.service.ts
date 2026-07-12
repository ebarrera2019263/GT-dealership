import type { AdminLeadsFiltros, LeadCrearInput } from '@concesionario/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async crear(input: LeadCrearInput) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: input.vehiculoId },
      select: {
        id: true,
        estado: true,
        anio: true,
        usuario: { select: { email: true } },
        marca: { select: { nombre: true } },
        modelo: { select: { nombre: true } },
      },
    });
    if (!vehiculo || vehiculo.estado !== 'publicado') {
      throw new NotFoundException('Anuncio no encontrado');
    }

    const [lead] = await this.prisma.$transaction([
      this.prisma.lead.create({ data: input }),
      this.prisma.vehiculo.update({
        where: { id: input.vehiculoId },
        data: { contactos: { increment: 1 } },
      }),
    ]);

    // Aviso al vendedor por la cola (envío real si hay SMTP; si no, queda en log).
    // Best-effort: un fallo de la cola no debe tumbar la creación del lead.
    const anuncio = `${vehiculo.marca.nombre} ${vehiculo.modelo.nombre} ${vehiculo.anio}`;
    try {
      await this.notificaciones.nuevoLead(vehiculo.usuario.email, anuncio, {
        nombre: input.nombre,
        medio: input.telefono ?? input.email ?? 'sin dato',
      });
    } catch {
      // el lead ya quedó persistido; la notificación es secundaria
    }

    return { id: lead.id, creadoEn: lead.creadoEn };
  }

  // Bandeja de leads del admin (esquema §6, módulo 8): contactos por anuncio.
  async listarAdmin(filtros: AdminLeadsFiltros) {
    const where: Prisma.LeadWhereInput = { vehiculoId: filtros.vehiculoId };
    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { id: 'desc' },
      take: filtros.limite + 1,
      ...(filtros.cursor ? { cursor: { id: filtros.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        nombre: true,
        telefono: true,
        email: true,
        canal: true,
        creadoEn: true,
        vehiculo: {
          select: {
            id: true,
            slug: true,
            anio: true,
            marca: { select: { nombre: true } },
            modelo: { select: { nombre: true } },
            usuario: { select: { nombre: true } },
          },
        },
      },
    });

    const hayMas = leads.length > filtros.limite;
    const pagina = hayMas ? leads.slice(0, filtros.limite) : leads;
    return {
      resultados: pagina,
      siguienteCursor: hayMas ? pagina[pagina.length - 1]?.id : null,
    };
  }
}
