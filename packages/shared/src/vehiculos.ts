import { z } from 'zod';
import { MONEDAS } from './roles';

export const TRACCIONES = ['4x2', '4x4', 'AWD'] as const;
export type Traccion = (typeof TRACCIONES)[number];

export const ESTADOS_VEHICULO = [
  'borrador',
  'en_revision',
  'publicado',
  'rechazado',
  'pausado',
  'expirado',
  'vendido',
] as const;
export type EstadoVehiculoStr = (typeof ESTADOS_VEHICULO)[number];

const ANIO_MIN = 1950;
const ANIO_MAX = new Date().getFullYear() + 1;

export const vehiculoCrearSchema = z.object({
  marcaId: z.number().int().positive(),
  modeloId: z.number().int().positive(),
  carroceriaId: z.number().int().positive(),
  anio: z.number().int().min(ANIO_MIN).max(ANIO_MAX),
  version: z.string().trim().max(80).optional(),
  precio: z.number().positive().max(99_999_999),
  moneda: z.enum(MONEDAS).default('GTQ'),
  precioNegociable: z.boolean().default(false),
  kilometraje: z.number().int().min(0).max(2_000_000),
  transmisionId: z.number().int().positive(),
  combustibleId: z.number().int().positive(),
  cilindrada: z.number().positive().max(12).optional(),
  potencia: z.number().int().positive().max(2000).optional(),
  puertas: z.number().int().min(2).max(6).optional(),
  color: z.string().trim().max(40).optional(),
  traccion: z.enum(TRACCIONES).optional(),
  numDuenos: z.number().int().min(1).max(20).optional(),
  descripcion: z.string().trim().max(5000).optional(),
  departamentoId: z.number().int().positive(),
  municipioId: z.number().int().positive(),
  caracteristicaIds: z.array(z.number().int().positive()).max(50).default([]),
});

export type VehiculoCrearInput = z.infer<typeof vehiculoCrearSchema>;

export const vehiculoActualizarSchema = vehiculoCrearSchema.partial();

export type VehiculoActualizarInput = z.infer<typeof vehiculoActualizarSchema>;

export const ORDENES_LISTADO = [
  'recientes',
  'precio_asc',
  'precio_desc',
  'km_asc',
  'anio_desc',
] as const;
export type OrdenListado = (typeof ORDENES_LISTADO)[number];

// Filtros del listado público (esquema §5.1). Los precios del filtro siempre
// se expresan en GTQ: la comparación es contra precio_gtq normalizado.
export const vehiculosFiltrosSchema = z.object({
  marca: z.string().trim().max(60).optional(),
  modelo: z.string().trim().max(60).optional(),
  carroceria: z.string().trim().max(60).optional(),
  anioMin: z.coerce.number().int().min(ANIO_MIN).optional(),
  anioMax: z.coerce.number().int().max(ANIO_MAX).optional(),
  precioMin: z.coerce.number().min(0).optional(),
  precioMax: z.coerce.number().positive().optional(),
  kmMax: z.coerce.number().int().positive().optional(),
  transmisionId: z.coerce.number().int().positive().optional(),
  combustibleId: z.coerce.number().int().positive().optional(),
  departamentoId: z.coerce.number().int().positive().optional(),
  orden: z.enum(ORDENES_LISTADO).default('recientes'),
  // Paginación por cursor (id del último resultado), no OFFSET
  cursor: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});

export type VehiculosFiltros = z.infer<typeof vehiculosFiltrosSchema>;

export const rechazoSchema = z.object({
  accion: z.literal('rechazar'),
  motivo: z.string().trim().min(5, 'El motivo del rechazo es obligatorio').max(500),
});

export const aprobacionSchema = z.object({
  accion: z.literal('aprobar'),
});

export const moderacionSchema = z.discriminatedUnion('accion', [aprobacionSchema, rechazoSchema]);

export type ModeracionInput = z.infer<typeof moderacionSchema>;

// ─────────────── Imágenes del anuncio ───────────────
// Reglas compartidas front↔back para la galería (esquema §5.2). El API valida
// el archivo real (mimetype/tamaño); el formulario solo usa esto de cortesía.
export const IMAGENES_POR_VEHICULO_MAX = 12;
export const IMAGEN_TAMANO_MAX_BYTES = 8 * 1024 * 1024; // 8 MB por archivo
export const IMAGEN_MIMES_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

// Reordenar/definir principal: se envía el orden deseado de ids. El primero
// queda como principal.
export const imagenesReordenarSchema = z.object({
  orden: z.array(z.number().int().positive()).min(1).max(IMAGENES_POR_VEHICULO_MAX),
});

export type ImagenesReordenarInput = z.infer<typeof imagenesReordenarSchema>;
