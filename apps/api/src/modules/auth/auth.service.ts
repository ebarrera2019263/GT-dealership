import { createHash, randomBytes } from 'node:crypto';
import type { LoginInput, RegistroInput } from '@concesionario/shared';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Rol, Usuario } from '@prisma/client';
import * as argon2 from 'argon2';
import { env } from '../../config/env';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from './auth.types';

export interface TokensEmitidos {
  accessToken: string;
  refreshToken: string;
}

export interface PerfilPublico {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(input: RegistroInput): Promise<{ usuario: PerfilPublico } & TokensEmitidos> {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        passwordHash: await argon2.hash(input.password),
        rol: input.rol as Rol,
      },
    });

    const tokens = await this.emitirTokens(usuario);
    return { usuario: this.aPerfil(usuario), ...tokens };
  }

  async login(input: LoginInput): Promise<{ usuario: PerfilPublico } & TokensEmitidos> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: input.email } });
    // Mismo error para email inexistente y contraseña mala: no filtrar cuáles emails existen.
    if (!usuario || !(await argon2.verify(usuario.passwordHash, input.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('Cuenta suspendida');
    }

    const tokens = await this.emitirTokens(usuario);
    return { usuario: this.aPerfil(usuario), ...tokens };
  }

  /** Rotación: el refresh token usado se revoca y se emite un par nuevo. */
  async refresh(refreshToken: string): Promise<TokensEmitidos> {
    const tokenHash = this.hashToken(refreshToken);
    const registro = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { usuario: true },
    });

    if (!registro || registro.revocadoEn || registro.expiraEn < new Date()) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
    if (!registro.usuario.activo) {
      throw new UnauthorizedException('Cuenta suspendida');
    }

    await this.prisma.refreshToken.update({
      where: { id: registro.id },
      data: { revocadoEn: new Date() },
    });

    return this.emitirTokens(registro.usuario);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revocadoEn: null },
      data: { revocadoEn: new Date() },
    });
  }

  private async emitirTokens(usuario: Usuario): Promise<TokensEmitidos> {
    const payload: JwtPayload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const accessToken = await this.jwtService.signAsync(payload);

    // Token opaco: en la base solo vive su hash, un robo de BD no roba sesiones.
    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: this.hashToken(refreshToken),
        expiraEn: new Date(Date.now() + env.JWT_REFRESH_TTL_DIAS * MS_POR_DIA),
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private aPerfil(usuario: Usuario): PerfilPublico {
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  }
}
