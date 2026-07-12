import type {
  EntidadFinancieraActualizarInput,
  EntidadFinancieraCrearInput,
  PlanFinanciamientoActualizarInput,
  PlanFinanciamientoCrearInput,
} from '@concesionario/shared';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditoriaService } from '../../common/auditoria.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanciamientoAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ─────────────── Entidades financieras ───────────────

  listarEntidades() {
    return this.prisma.entidadFinanciera.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        logoUrl: true,
        activo: true,
        _count: { select: { planes: true } },
      },
    });
  }

  async crearEntidad(actor: { id: number }, input: EntidadFinancieraCrearInput, ip?: string) {
    const entidad = await this.conflicto(() =>
      this.prisma.entidadFinanciera.create({
        data: { nombre: input.nombre, logoUrl: input.logoUrl },
        select: { id: true, nombre: true, logoUrl: true, activo: true },
      }),
    );
    await this.auditar(actor, 'entidad_financiera.crear', entidad.id, undefined, entidad, ip);
    return entidad;
  }

  async actualizarEntidad(
    actor: { id: number },
    id: number,
    input: EntidadFinancieraActualizarInput,
    ip?: string,
  ) {
    const antes = await this.buscarEntidad(id);
    const entidad = await this.conflicto(() =>
      this.prisma.entidadFinanciera.update({
        where: { id },
        data: { nombre: input.nombre, logoUrl: input.logoUrl, activo: input.activo },
        select: { id: true, nombre: true, logoUrl: true, activo: true },
      }),
    );
    await this.auditar(actor, 'entidad_financiera.actualizar', id, antes, entidad, ip);
    return entidad;
  }

  // ─────────────── Planes ───────────────

  listarPlanes(entidadId?: number) {
    return this.prisma.planFinanciamiento.findMany({
      where: { entidadId },
      orderBy: [{ entidadId: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        entidadId: true,
        nombre: true,
        tasaAnual: true,
        plazoMin: true,
        plazoMax: true,
        engancheMinPct: true,
        aplicaA: true,
        requisitos: true,
        activo: true,
        entidad: { select: { nombre: true } },
      },
    });
  }

  async crearPlan(actor: { id: number }, input: PlanFinanciamientoCrearInput, ip?: string) {
    await this.buscarEntidad(input.entidadId);
    const plan = await this.prisma.planFinanciamiento.create({
      data: {
        entidadId: input.entidadId,
        nombre: input.nombre,
        tasaAnual: input.tasaAnual,
        plazoMin: input.plazoMin,
        plazoMax: input.plazoMax,
        engancheMinPct: input.engancheMinPct,
        aplicaA: input.aplicaA,
        requisitos: input.requisitos ?? Prisma.JsonNull,
      },
      select: { id: true, nombre: true },
    });
    await this.auditar(actor, 'plan_financiamiento.crear', plan.id, undefined, plan, ip);
    return plan;
  }

  async actualizarPlan(
    actor: { id: number },
    id: number,
    input: PlanFinanciamientoActualizarInput,
    ip?: string,
  ) {
    const antes = await this.buscarPlan(id);
    const plan = await this.prisma.planFinanciamiento.update({
      where: { id },
      data: {
        nombre: input.nombre,
        tasaAnual: input.tasaAnual,
        plazoMin: input.plazoMin,
        plazoMax: input.plazoMax,
        engancheMinPct: input.engancheMinPct,
        aplicaA: input.aplicaA,
        activo: input.activo,
        ...(input.requisitos !== undefined ? { requisitos: input.requisitos } : {}),
      },
      select: { id: true, nombre: true, activo: true },
    });
    await this.auditar(actor, 'plan_financiamiento.actualizar', id, antes, plan, ip);
    return plan;
  }

  // ─────────────── Helpers ───────────────

  private async buscarEntidad(id: number) {
    const entidad = await this.prisma.entidadFinanciera.findUnique({
      where: { id },
      select: { id: true, nombre: true, logoUrl: true, activo: true },
    });
    if (!entidad) throw new NotFoundException('Entidad financiera no encontrada');
    return entidad;
  }

  private async buscarPlan(id: number) {
    const plan = await this.prisma.planFinanciamiento.findUnique({
      where: { id },
      select: { id: true, nombre: true, activo: true },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  private async conflicto<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ya existe una entidad con ese nombre');
      }
      throw e;
    }
  }

  private auditar(
    actor: { id: number },
    accion: string,
    entidadId: number,
    antes: object | undefined,
    despues: object,
    ip?: string,
  ) {
    const [entidad] = accion.split('.');
    return this.auditoria.registrar({
      usuarioId: actor.id,
      accion,
      entidad,
      entidadId,
      datosAntes: antes as Prisma.InputJsonValue | undefined,
      datosDespues: despues as Prisma.InputJsonValue,
      ip,
    });
  }
}
