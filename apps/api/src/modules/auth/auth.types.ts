import type { Rol } from '@prisma/client';
import type { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: Rol;
}

export interface UsuarioAutenticado {
  id: number;
  email: string;
  rol: Rol;
}

export type RequestConUsuario = Request & { usuario?: UsuarioAutenticado };
