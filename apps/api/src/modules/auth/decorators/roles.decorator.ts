import { SetMetadata } from '@nestjs/common';
import type { Rol } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restringe un endpoint a los roles indicados. Sin este decorador basta estar autenticado. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
