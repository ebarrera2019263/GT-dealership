import type { AdminLeadsFiltros, LeadCrearInput } from '@concesionario/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(input: LeadCrearInput) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: input.vehiculoId },
      select: { id: true, estado: true },
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
    // El email al vendedor sale por un worker de BullMQ (Fase 2); acá solo se persiste.
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
