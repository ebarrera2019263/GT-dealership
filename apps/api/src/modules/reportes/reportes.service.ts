import type { AdminReportesFiltros, ReporteCrearInput } from '@concesionario/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditoriaService } from '../../common/auditoria.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // Denuncia pública de un anuncio (esquema §6, módulo 9). Anónima.
  async crear(input: ReporteCrearInput) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: input.vehiculoId },
      select: { id: true, estado: true },
    });
    if (!vehiculo || vehiculo.estado !== 'publicado') {
      throw new NotFoundException('Anuncio no encontrado');
    }
    const reporte = await this.prisma.reporte.create({
      data: { vehiculoId: input.vehiculoId, motivo: input.motivo, detalle: input.detalle },
      select: { id: true },
    });
    return { id: reporte.id };
  }

  async listarAdmin(filtros: AdminReportesFiltros) {
    const where: Prisma.ReporteWhereInput = { estado: filtros.estado };
    const reportes = await this.prisma.reporte.findMany({
      where,
      // Abiertos primero; dentro de cada grupo, los más nuevos arriba.
      orderBy: [{ estado: 'asc' }, { id: 'desc' }],
      take: filtros.limite + 1,
      ...(filtros.cursor ? { cursor: { id: filtros.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        motivo: true,
        detalle: true,
        estado: true,
        creadoEn: true,
        vehiculo: {
          select: {
            id: true,
            slug: true,
            anio: true,
            estado: true,
            marca: { select: { nombre: true } },
            modelo: { select: { nombre: true } },
          },
        },
      },
    });

    const hayMas = reportes.length > filtros.limite;
    const pagina = hayMas ? reportes.slice(0, filtros.limite) : reportes;
    return {
      resultados: pagina,
      siguienteCursor: hayMas ? pagina[pagina.length - 1]?.id : null,
    };
  }

  async resolver(actor: { id: number }, id: number, ip?: string) {
    const reporte = await this.prisma.reporte.findUnique({
      where: { id },
      select: { estado: true },
    });
    if (!reporte) {
      throw new NotFoundException('Reporte no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.reporte.update({
        where: { id },
        data: { estado: 'resuelto' },
        select: { id: true, estado: true },
      });
      await this.auditoria.registrar(
        {
          usuarioId: actor.id,
          accion: 'reporte.resolver',
          entidad: 'reporte',
          entidadId: id,
          datosAntes: { estado: reporte.estado },
          datosDespues: { estado: 'resuelto' },
          ip,
        },
        tx,
      );
      return actualizado;
    });
  }
}
