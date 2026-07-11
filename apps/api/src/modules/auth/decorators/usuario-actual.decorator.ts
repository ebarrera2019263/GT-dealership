import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RequestConUsuario, UsuarioAutenticado } from '../auth.types';

export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioAutenticado => {
    const request = ctx.switchToHttp().getRequest<RequestConUsuario>();
    if (!request.usuario) {
      throw new Error('UsuarioActual usado en un endpoint sin autenticación');
    }
    return request.usuario;
  },
);
