import { z } from 'zod';
import { ORDENES_LISTADO } from './vehiculos';

// Criterios de una búsqueda guardada (esquema §5.2): el mismo subconjunto de
// filtros del listado, sin paginación. Se guardan como JSON.
export const criteriosBusquedaSchema = z.object({
  marca: z.string().trim().max(60).optional(),
  modelo: z.string().trim().max(60).optional(),
  carroceria: z.string().trim().max(60).optional(),
  anioMin: z.coerce.number().int().optional(),
  anioMax: z.coerce.number().int().optional(),
  precioMin: z.coerce.number().optional(),
  precioMax: z.coerce.number().optional(),
  kmMax: z.coerce.number().int().optional(),
  transmisionId: z.coerce.number().int().optional(),
  combustibleId: z.coerce.number().int().optional(),
  departamentoId: z.coerce.number().int().optional(),
  orden: z.enum(ORDENES_LISTADO).optional(),
});

export type CriteriosBusqueda = z.infer<typeof criteriosBusquedaSchema>;

export const busquedaCrearSchema = z.object({
  criterios: criteriosBusquedaSchema,
});

export type BusquedaCrearInput = z.infer<typeof busquedaCrearSchema>;

export const busquedaActualizarSchema = z.object({
  alertaActiva: z.boolean(),
});

export type BusquedaActualizarInput = z.infer<typeof busquedaActualizarSchema>;
