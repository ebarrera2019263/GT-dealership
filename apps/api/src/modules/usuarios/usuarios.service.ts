import type { AdminUsuariosFiltros, PerfilUpdateInput, Rol } from '@concesionario/shared';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditoriaService } from '../../common/auditoria.service';
import { PrismaService } from '../../prisma/prisma.service';

// El password_hash jamás sale del servicio.
const PERFIL_SELECT = {
  id: true,
  nombre: true,
  email: true,
  telefono: true,
  rol: true,
  emailVerificado: true,
  telefonoVerificado: true,
  avatarUrl: true,
  creadoEn: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async obtenerPerfil(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: PERFIL_SELECT,
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async actualizarPerfil(usuarioId: number, cambios: PerfilUpdateInput) {
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: cambios,
      select: PERFIL_SELECT,
    });
  }

  // ─────────────── Admin: listado, rol, suspensión (esquema §5.4, §6 módulo 7) ───────────────

  async listarAdmin(filtros: AdminUsuariosFiltros) {
    const where: Prisma.UsuarioWhereInput = {
      rol: filtros.rol,
      activo: filtros.activo,
      ...(filtros.busqueda
        ? {
            OR: [
              { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
              { email: { contains: filtros.busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const usuarios = await this.prisma.usuario.findMany({
      where,
      orderBy: { id: 'desc' },
      take: filtros.limite + 1,
      ...(filtros.cursor ? { cursor: { id: filtros.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        activo: true,
        emailVerificado: true,
        telefonoVerificado: true,
        creadoEn: true,
        _count: { select: { vehiculos: true } },
      },
    });

    const hayMas = usuarios.length > filtros.limite;
    const pagina = hayMas ? usuarios.slice(0, filtros.limite) : usuarios;
    return {
      resultados: pagina.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        rol: u.rol,
        activo: u.activo,
        emailVerificado: u.emailVerificado,
        telefonoVerificado: u.telefonoVerificado,
        creadoEn: u.creadoEn,
        anuncios: u._count.vehiculos,
      })),
      siguienteCursor: hayMas ? pagina[pagina.length - 1]?.id : null,
    };
  }

  async cambiarRol(actor: { id: number }, id: number, rol: Rol, ip?: string) {
    if (actor.id === id) {
      throw new ForbiddenException('No podés cambiar tu propio rol');
    }
    const antes = await this.buscar(id, { rol: true });

    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.usuario.update({
        where: { id },
        data: { rol },
        select: { id: true, rol: true },
      });
      await this.auditoria.registrar(
        {
          usuarioId: actor.id,
          accion: 'usuario.rol',
          entidad: 'usuario',
          entidadId: id,
          datosAntes: { rol: antes.rol },
          datosDespues: { rol },
          ip,
        },
        tx,
      );
      return actualizado;
    });
  }

  async cambiarActivo(actor: { id: number }, id: number, activo: boolean, ip?: string) {
    if (actor.id === id && !activo) {
      throw new ForbiddenException('No podés suspenderte a vos mismo');
    }
    const antes = await this.buscar(id, { activo: true });

    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.usuario.update({
        where: { id },
        data: { activo },
        select: { id: true, activo: true },
      });
      // Suspender corta las sesiones: sin refresh token, el acceso muere al expirar.
      if (!activo) {
        await tx.refreshToken.deleteMany({ where: { usuarioId: id } });
      }
      await this.auditoria.registrar(
        {
          usuarioId: actor.id,
          accion: 'usuario.activo',
          entidad: 'usuario',
          entidadId: id,
          datosAntes: { activo: antes.activo },
          datosDespues: { activo },
          ip,
        },
        tx,
      );
      return actualizado;
    });
  }

  private async buscar<T extends Prisma.UsuarioSelect>(id: number, select: T) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }, select });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }
}
