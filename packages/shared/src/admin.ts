import { z } from 'zod';
import { ROLES } from './roles';
import { ESTADOS_VEHICULO } from './vehiculos';

// Filtros de la tabla de vehículos del admin (esquema §6, módulo 2): a
// diferencia del listado público, ve cualquier estado y filtra por vendedor.
export const adminVehiculosFiltrosSchema = z.object({
  estado: z.enum(ESTADOS_VEHICULO).optional(),
  marca: z.string().trim().max(60).optional(),
  vendedorId: z.coerce.number().int().positive().optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});

export type AdminVehiculosFiltros = z.infer<typeof adminVehiculosFiltrosSchema>;

// Toggle booleano reutilizable (verificar/destacar anuncios, activar/suspender
// usuarios).
export const cambioBooleanoSchema = z.object({
  valor: z.boolean(),
});

export type CambioBooleanoInput = z.infer<typeof cambioBooleanoSchema>;

// Listado de usuarios del admin (esquema §6, módulo 7).
export const adminUsuariosFiltrosSchema = z.object({
  rol: z.enum(ROLES).optional(),
  // Query param: 'true'/'false' explícitos (z.coerce.boolean trata "false" como true).
  activo: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  busqueda: z.string().trim().max(120).optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});

export type AdminUsuariosFiltros = z.infer<typeof adminUsuariosFiltrosSchema>;

export const cambiarRolSchema = z.object({
  rol: z.enum(ROLES),
});

export type CambiarRolInput = z.infer<typeof cambiarRolSchema>;

// ─────────────── Catálogo maestro (esquema §6, módulo 5) ───────────────

const slugOpcional = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido: solo minúsculas, números y guiones')
  .optional();

export const marcaCrearSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
  slug: slugOpcional,
  logoUrl: z.string().url().max(300).optional(),
});

export type MarcaCrearInput = z.infer<typeof marcaCrearSchema>;

export const marcaActualizarSchema = z.object({
  nombre: z.string().trim().min(1).max(60).optional(),
  slug: slugOpcional,
  logoUrl: z.string().url().max(300).nullable().optional(),
  activo: z.boolean().optional(),
});

export type MarcaActualizarInput = z.infer<typeof marcaActualizarSchema>;

export const modeloCrearSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
  slug: slugOpcional,
});

export type ModeloCrearInput = z.infer<typeof modeloCrearSchema>;

export const modeloActualizarSchema = z.object({
  nombre: z.string().trim().min(1).max(60).optional(),
  slug: slugOpcional,
  activo: z.boolean().optional(),
});

export type ModeloActualizarInput = z.infer<typeof modeloActualizarSchema>;

// Carrocerías (tienen slug e ícono).
export const carroceriaCrearSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
  slug: slugOpcional,
  icono: z.string().trim().max(60).optional(),
});

export type CarroceriaCrearInput = z.infer<typeof carroceriaCrearSchema>;

export const carroceriaActualizarSchema = z.object({
  nombre: z.string().trim().min(1).max(60).optional(),
  slug: slugOpcional,
  icono: z.string().trim().max(60).nullable().optional(),
});

export type CarroceriaActualizarInput = z.infer<typeof carroceriaActualizarSchema>;

// Combustibles (solo nombre).
export const combustibleCrearSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
});

export type CombustibleCrearInput = z.infer<typeof combustibleCrearSchema>;

export const combustibleActualizarSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
});

export type CombustibleActualizarInput = z.infer<typeof combustibleActualizarSchema>;

// Características (nombre + categoría).
export const caracteristicaCrearSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
  categoria: z.string().trim().min(1).max(40),
});

export type CaracteristicaCrearInput = z.infer<typeof caracteristicaCrearSchema>;

export const caracteristicaActualizarSchema = z.object({
  nombre: z.string().trim().min(1).max(60).optional(),
  categoria: z.string().trim().min(1).max(40).optional(),
});

export type CaracteristicaActualizarInput = z.infer<typeof caracteristicaActualizarSchema>;

// ─────────────── Leads del admin (esquema §6, módulo 8) ───────────────

export const adminLeadsFiltrosSchema = z.object({
  vehiculoId: z.coerce.number().int().positive().optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});

export type AdminLeadsFiltros = z.infer<typeof adminLeadsFiltrosSchema>;

// ─────────────── Auditoría (esquema §3.7, §6 módulo 10) ───────────────

export const adminAuditoriaFiltrosSchema = z.object({
  entidad: z.string().trim().max(40).optional(),
  accion: z.string().trim().max(60).optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(30),
});

export type AdminAuditoriaFiltros = z.infer<typeof adminAuditoriaFiltrosSchema>;
