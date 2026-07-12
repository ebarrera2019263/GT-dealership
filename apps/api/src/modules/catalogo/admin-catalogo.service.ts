import type {
  MarcaActualizarInput,
  MarcaCrearInput,
  ModeloActualizarInput,
  ModeloCrearInput,
} from '@concesionario/shared';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditoriaService } from '../../common/auditoria.service';
import { PrismaService } from '../../prisma/prisma.service';

/** Nombre → slug: sin acentos, minúsculas, guiones. */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AdminCatalogoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ─────────────── Marcas ───────────────

  listarMarcas() {
    return this.prisma.marca.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        slug: true,
        logoUrl: true,
        activo: true,
        _count: { select: { modelos: true, vehiculos: true } },
      },
    });
  }

  async crearMarca(actor: { id: number }, input: MarcaCrearInput, ip?: string) {
    const slug = input.slug ?? slugify(input.nombre);
    const marca = await this.conflicto(() =>
      this.prisma.marca.create({
        data: { nombre: input.nombre, slug, logoUrl: input.logoUrl },
        select: { id: true, nombre: true, slug: true },
      }),
    );
    await this.auditar(actor, 'marca.crear', 'marca', marca.id, undefined, marca, ip);
    return marca;
  }

  async actualizarMarca(
    actor: { id: number },
    id: number,
    input: MarcaActualizarInput,
    ip?: string,
  ) {
    const antes = await this.buscarMarca(id);
    const marca = await this.conflicto(() =>
      this.prisma.marca.update({
        where: { id },
        data: {
          nombre: input.nombre,
          slug: input.slug,
          logoUrl: input.logoUrl,
          activo: input.activo,
        },
        select: { id: true, nombre: true, slug: true, logoUrl: true, activo: true },
      }),
    );
    await this.auditar(actor, 'marca.actualizar', 'marca', id, antes, marca, ip);
    return marca;
  }

  // ─────────────── Modelos ───────────────

  async listarModelos(marcaId: number) {
    await this.buscarMarca(marcaId);
    return this.prisma.modelo.findMany({
      where: { marcaId },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        slug: true,
        activo: true,
        _count: { select: { vehiculos: true } },
      },
    });
  }

  async crearModelo(actor: { id: number }, marcaId: number, input: ModeloCrearInput, ip?: string) {
    await this.buscarMarca(marcaId);
    const slug = input.slug ?? slugify(input.nombre);
    const modelo = await this.conflicto(() =>
      this.prisma.modelo.create({
        data: { marcaId, nombre: input.nombre, slug },
        select: { id: true, nombre: true, slug: true, activo: true },
      }),
    );
    await this.auditar(actor, 'modelo.crear', 'modelo', modelo.id, undefined, modelo, ip);
    return modelo;
  }

  async actualizarModelo(
    actor: { id: number },
    id: number,
    input: ModeloActualizarInput,
    ip?: string,
  ) {
    const antes = await this.buscarModelo(id);
    const modelo = await this.conflicto(() =>
      this.prisma.modelo.update({
        where: { id },
        data: { nombre: input.nombre, slug: input.slug, activo: input.activo },
        select: { id: true, nombre: true, slug: true, activo: true },
      }),
    );
    await this.auditar(actor, 'modelo.actualizar', 'modelo', id, antes, modelo, ip);
    return modelo;
  }

  // ─────────────── Helpers ───────────────

  private async buscarMarca(id: number) {
    const marca = await this.prisma.marca.findUnique({
      where: { id },
      select: { id: true, nombre: true, slug: true, logoUrl: true, activo: true },
    });
    if (!marca) throw new NotFoundException('Marca no encontrada');
    return marca;
  }

  private async buscarModelo(id: number) {
    const modelo = await this.prisma.modelo.findUnique({
      where: { id },
      select: { id: true, nombre: true, slug: true, activo: true },
    });
    if (!modelo) throw new NotFoundException('Modelo no encontrado');
    return modelo;
  }

  /** Traduce la violación de unicidad de Prisma (P2002) en un 409 legible. */
  private async conflicto<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ya existe un registro con ese nombre o slug');
      }
      throw e;
    }
  }

  private auditar(
    actor: { id: number },
    accion: string,
    entidad: string,
    entidadId: number,
    antes: object | undefined,
    despues: object,
    ip?: string,
  ) {
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
