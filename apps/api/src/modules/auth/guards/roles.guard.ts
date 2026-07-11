import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Rol } from '@prisma/client';
import type { RequestConUsuario } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Primer nivel de autorización: el rol. El segundo nivel — la regla de
 * propiedad (un vendedor solo toca SUS anuncios) — se verifica en cada
 * servicio, no acá: el guard no conoce el recurso.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const { usuario } = context.switchToHttp().getRequest<RequestConUsuario>();
    if (!usuario || !rolesRequeridos.includes(usuario.rol)) {
      throw new ForbiddenException('No tenés permisos para esta operación');
    }
    return true;
  }
}
