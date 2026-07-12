import type {
  CaracteristicaActualizarInput,
  CaracteristicaCrearInput,
  CarroceriaActualizarInput,
  CarroceriaCrearInput,
  CombustibleActualizarInput,
  CombustibleCrearInput,
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

  // ─────────────── Carrocerías ───────────────

  listarCarrocerias() {
    return this.prisma.carroceria.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        slug: true,
        icono: true,
        _count: { select: { vehiculos: true } },
      },
    });
  }

  async crearCarroceria(actor: { id: number }, input: CarroceriaCrearInput, ip?: string) {
    const slug = input.slug ?? slugify(input.nombre);
    const carroceria = await this.conflicto(() =>
      this.prisma.carroceria.create({
        data: { nombre: input.nombre, slug, icono: input.icono },
        select: { id: true, nombre: true, slug: true, icono: true },
      }),
    );
    await this.auditar(
      actor,
      'carroceria.crear',
      'carroceria',
      carroceria.id,
      undefined,
      carroceria,
      ip,
    );
    return carroceria;
  }

  async actualizarCarroceria(
    actor: { id: number },
    id: number,
    input: CarroceriaActualizarInput,
    ip?: string,
  ) {
    const antes = await this.buscar('carroceria', id);
    const carroceria = await this.conflicto(() =>
      this.prisma.carroceria.update({
        where: { id },
        data: { nombre: input.nombre, slug: input.slug, icono: input.icono },
        select: { id: true, nombre: true, slug: true, icono: true },
      }),
    );
    await this.auditar(actor, 'carroceria.actualizar', 'carroceria', id, antes, carroceria, ip);
    return carroceria;
  }

  async eliminarCarroceria(actor: { id: number }, id: number, ip?: string) {
    const antes = await this.buscar('carroceria', id);
    await this.exigirSinUso(
      this.prisma.vehiculo.count({ where: { carroceriaId: id } }),
      'carrocería',
    );
    await this.prisma.carroceria.delete({ where: { id } });
    await this.auditar(actor, 'carroceria.eliminar', 'carroceria', id, antes, {}, ip);
    return { id };
  }

  // ─────────────── Combustibles ───────────────

  listarCombustibles() {
    return this.prisma.combustible.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, _count: { select: { vehiculos: true } } },
    });
  }

  async crearCombustible(actor: { id: number }, input: CombustibleCrearInput, ip?: string) {
    const combustible = await this.conflicto(() =>
      this.prisma.combustible.create({
        data: { nombre: input.nombre },
        select: { id: true, nombre: true },
      }),
    );
    await this.auditar(
      actor,
      'combustible.crear',
      'combustible',
      combustible.id,
      undefined,
      combustible,
      ip,
    );
    return combustible;
  }

  async actualizarCombustible(
    actor: { id: number },
    id: number,
    input: CombustibleActualizarInput,
    ip?: string,
  ) {
    const antes = await this.buscar('combustible', id);
    const combustible = await this.conflicto(() =>
      this.prisma.combustible.update({
        where: { id },
        data: { nombre: input.nombre },
        select: { id: true, nombre: true },
      }),
    );
    await this.auditar(actor, 'combustible.actualizar', 'combustible', id, antes, combustible, ip);
    return combustible;
  }

  async eliminarCombustible(actor: { id: number }, id: number, ip?: string) {
    const antes = await this.buscar('combustible', id);
    await this.exigirSinUso(
      this.prisma.vehiculo.count({ where: { combustibleId: id } }),
      'combustible',
    );
    await this.prisma.combustible.delete({ where: { id } });
    await this.auditar(actor, 'combustible.eliminar', 'combustible', id, antes, {}, ip);
    return { id };
  }

  // ─────────────── Características ───────────────

  listarCaracteristicas() {
    return this.prisma.caracteristica.findMany({
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        categoria: true,
        _count: { select: { vehiculos: true } },
      },
    });
  }

  async crearCaracteristica(actor: { id: number }, input: CaracteristicaCrearInput, ip?: string) {
    const caracteristica = await this.conflicto(() =>
      this.prisma.caracteristica.create({
        data: { nombre: input.nombre, categoria: input.categoria },
        select: { id: true, nombre: true, categoria: true },
      }),
    );
    await this.auditar(
      actor,
      'caracteristica.crear',
      'caracteristica',
      caracteristica.id,
      undefined,
      caracteristica,
      ip,
    );
    return caracteristica;
  }

  async actualizarCaracteristica(
    actor: { id: number },
    id: number,
    input: CaracteristicaActualizarInput,
    ip?: string,
  ) {
    const antes = await this.buscar('caracteristica', id);
    const caracteristica = await this.conflicto(() =>
      this.prisma.caracteristica.update({
        where: { id },
        data: { nombre: input.nombre, categoria: input.categoria },
        select: { id: true, nombre: true, categoria: true },
      }),
    );
    await this.auditar(
      actor,
      'caracteristica.actualizar',
      'caracteristica',
      id,
      antes,
      caracteristica,
      ip,
    );
    return caracteristica;
  }

  async eliminarCaracteristica(actor: { id: number }, id: number, ip?: string) {
    const antes = await this.buscar('caracteristica', id);
    await this.exigirSinUso(
      this.prisma.vehiculoCaracteristica.count({ where: { caracteristicaId: id } }),
      'característica',
    );
    await this.prisma.caracteristica.delete({ where: { id } });
    await this.auditar(actor, 'caracteristica.eliminar', 'caracteristica', id, antes, {}, ip);
    return { id };
  }

  // ─────────────── Helpers ───────────────

  /** Bloquea el borrado si la entidad todavía está referenciada por anuncios. */
  private async exigirSinUso(conteo: Promise<number>, etiqueta: string) {
    const total = await conteo;
    if (total > 0) {
      throw new ConflictException(
        `No se puede borrar: ${total} anuncio(s) usan esta ${etiqueta}. Reasignalos primero.`,
      );
    }
  }

  /** Busca una fila de catálogo por id o lanza 404; devuelve los datos para auditar el "antes". */
  private async buscar(
    entidad: 'carroceria' | 'combustible' | 'caracteristica',
    id: number,
  ): Promise<object> {
    const fila =
      entidad === 'carroceria'
        ? await this.prisma.carroceria.findUnique({ where: { id } })
        : entidad === 'combustible'
          ? await this.prisma.combustible.findUnique({ where: { id } })
          : await this.prisma.caracteristica.findUnique({ where: { id } });
    if (!fila) throw new NotFoundException('Registro no encontrado');
    return fila;
  }

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
