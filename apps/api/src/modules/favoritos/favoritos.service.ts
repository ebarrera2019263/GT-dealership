import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UsuarioAutenticado } from '../auth/auth.types';

// Mismo resumen que usa el listado público para las tarjetas.
const RESUMEN = {
  id: true,
  slug: true,
  anio: true,
  version: true,
  precio: true,
  moneda: true,
  precioGtq: true,
  kilometraje: true,
  destacado: true,
  verificado: true,
  estado: true,
  publicadoEn: true,
  marca: { select: { nombre: true, slug: true } },
  modelo: { select: { nombre: true, slug: true } },
  carroceria: { select: { nombre: true } },
  transmision: { select: { nombre: true } },
  combustible: { select: { nombre: true } },
  departamento: { select: { nombre: true } },
  imagenes: { where: { esPrincipal: true }, take: 1, select: { urlThumb: true, url: true } },
} as const;

@Injectable()
export class FavoritosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Agrega a favoritos (idempotente). */
  async agregar(usuario: UsuarioAutenticado, vehiculoId: number) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: { id: true },
    });
    if (!vehiculo) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    await this.prisma.favorito.upsert({
      where: { usuarioId_vehiculoId: { usuarioId: usuario.id, vehiculoId } },
      create: { usuarioId: usuario.id, vehiculoId },
      update: {},
    });
    return { vehiculoId, favorito: true };
  }

  /** Quita de favoritos (idempotente). */
  async quitar(usuario: UsuarioAutenticado, vehiculoId: number) {
    await this.prisma.favorito.deleteMany({ where: { usuarioId: usuario.id, vehiculoId } });
    return { vehiculoId, favorito: false };
  }

  /** Solo los ids, para pintar el estado del corazón en las tarjetas. */
  async ids(usuario: UsuarioAutenticado) {
    const favs = await this.prisma.favorito.findMany({
      where: { usuarioId: usuario.id },
      select: { vehiculoId: true },
    });
    return { ids: favs.map((f) => f.vehiculoId) };
  }

  /** Lista de favoritos con el resumen del vehículo (los más nuevos primero). */
  async lista(usuario: UsuarioAutenticado) {
    const favs = await this.prisma.favorito.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { creadoEn: 'desc' },
      select: { vehiculo: { select: RESUMEN } },
    });
    return favs.map((f) => f.vehiculo);
  }
}
