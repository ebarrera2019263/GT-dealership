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
