import { z } from 'zod';
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

// Toggle booleano reutilizable para verificar/destacar.
export const cambioBooleanoSchema = z.object({
  valor: z.boolean(),
});

export type CambioBooleanoInput = z.infer<typeof cambioBooleanoSchema>;
