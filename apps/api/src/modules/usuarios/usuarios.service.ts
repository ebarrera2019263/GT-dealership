import type { PerfilUpdateInput } from '@concesionario/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(private readonly prisma: PrismaService) {}

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
}
