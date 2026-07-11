import type { LeadCrearInput } from '@concesionario/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
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
}
