import { z } from 'zod';
import { ROLES } from './roles';

// Roles que un usuario puede elegir al registrarse; admin solo se asigna desde el panel.
const ROLES_REGISTRO = ROLES.filter((r) => r !== 'admin');

export const registroSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es muy corto').max(120),
  email: z.email('Email inválido').toLowerCase(),
  telefono: z
    .string()
    .regex(/^\+?\d{8,15}$/, 'Teléfono inválido')
    .optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  rol: z.enum(ROLES_REGISTRO as [string, ...string[]]).default('comprador'),
});

export type RegistroInput = z.infer<typeof registroSchema>;

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(32),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const perfilUpdateSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  telefono: z
    .string()
    .regex(/^\+?\d{8,15}$/, 'Teléfono inválido')
    .nullable()
    .optional(),
  avatarUrl: z.url().nullable().optional(),
});

export type PerfilUpdateInput = z.infer<typeof perfilUpdateSchema>;
