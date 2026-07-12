import {
  type AdminSolicitudesFiltros,
  calcularCuotaNivelada,
  type EstadoSolicitud,
  type SolicitudCreditoCrearInput,
} from '@concesionario/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditoriaService } from '../../common/auditoria.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SolicitudesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // Alta de una solicitud (comprador autenticado). El server valida contra el
  // plan y recalcula la cuota; nunca confía en el número que manda el cliente.
  async crear(usuario: { id: number }, input: SolicitudCreditoCrearInput) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: input.vehiculoId },
      select: { id: true, estado: true, precio: true },
    });
    if (!vehiculo || vehiculo.estado !== 'publicado') {
      throw new NotFoundException('Anuncio no encontrado');
    }

    const plan = await this.prisma.planFinanciamiento.findUnique({
      where: { id: input.planId },
      select: {
        activo: true,
        tasaAnual: true,
        plazoMin: true,
        plazoMax: true,
        engancheMinPct: true,
        entidad: { select: { activo: true } },
      },
    });
    if (!plan || !plan.activo || !plan.entidad.activo) {
      throw new NotFoundException('Plan de financiamiento no disponible');
    }

    const precio = Number(vehiculo.precio);
    const engancheMin = (precio * Number(plan.engancheMinPct)) / 100;
    if (input.enganche < engancheMin) {
      throw new BadRequestException(`El enganche mínimo para este plan es ${engancheMin}`);
    }
    if (input.enganche >= precio) {
      throw new BadRequestException('El enganche debe ser menor al precio');
    }
    if (input.plazo < plan.plazoMin || input.plazo > plan.plazoMax) {
      throw new BadRequestException(
        `El plazo debe estar entre ${plan.plazoMin} y ${plan.plazoMax} meses`,
      );
    }

    const cuotaEstimada = calcularCuotaNivelada({
      precio,
      enganche: input.enganche,
      plazo: input.plazo,
      tasaAnual: Number(plan.tasaAnual),
    });

    const solicitud = await this.prisma.solicitudCredito.create({
      data: {
        vehiculoId: input.vehiculoId,
        usuarioId: usuario.id,
        planId: input.planId,
        monto: precio,
        enganche: input.enganche,
        plazo: input.plazo,
        cuotaEstimada,
      },
      select: { id: true, cuotaEstimada: true },
    });
    return { id: solicitud.id, cuotaEstimada: solicitud.cuotaEstimada };
  }

  // Las mías (comprador): para ver el estado de mis trámites.
  misSolicitudes(usuarioId: number) {
    return this.prisma.solicitudCredito.findMany({
      where: { usuarioId },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        monto: true,
        enganche: true,
        plazo: true,
        cuotaEstimada: true,
        estado: true,
        creadoEn: true,
        vehiculo: {
          select: {
            slug: true,
            anio: true,
            marca: { select: { nombre: true } },
            modelo: { select: { nombre: true } },
          },
        },
        plan: { select: { nombre: true, entidad: { select: { nombre: true } } } },
      },
    });
  }

  async listarAdmin(filtros: AdminSolicitudesFiltros) {
    const where: Prisma.SolicitudCreditoWhereInput = { estado: filtros.estado };
    const solicitudes = await this.prisma.solicitudCredito.findMany({
      where,
      orderBy: [{ estado: 'asc' }, { id: 'desc' }],
      take: filtros.limite + 1,
      ...(filtros.cursor ? { cursor: { id: filtros.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        monto: true,
        enganche: true,
        plazo: true,
        cuotaEstimada: true,
        estado: true,
        creadoEn: true,
        usuario: { select: { id: true, nombre: true, email: true, telefono: true } },
        vehiculo: {
          select: {
            slug: true,
            anio: true,
            marca: { select: { nombre: true } },
            modelo: { select: { nombre: true } },
          },
        },
        plan: { select: { nombre: true, entidad: { select: { nombre: true } } } },
      },
    });

    const hayMas = solicitudes.length > filtros.limite;
    const pagina = hayMas ? solicitudes.slice(0, filtros.limite) : solicitudes;
    return {
      resultados: pagina,
      siguienteCursor: hayMas ? pagina[pagina.length - 1]?.id : null,
    };
  }

  async cambiarEstado(actor: { id: number }, id: number, estado: EstadoSolicitud, ip?: string) {
    const solicitud = await this.prisma.solicitudCredito.findUnique({
      where: { id },
      select: { estado: true },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return this.prisma.$transaction(async (tx) => {
      const actualizada = await tx.solicitudCredito.update({
        where: { id },
        data: { estado },
        select: { id: true, estado: true },
      });
      await this.auditoria.registrar(
        {
          usuarioId: actor.id,
          accion: 'solicitud_credito.estado',
          entidad: 'solicitud_credito',
          entidadId: id,
          datosAntes: { estado: solicitud.estado },
          datosDespues: { estado },
          ip,
        },
        tx,
      );
      return actualizada;
    });
  }
}
