import { z } from 'zod';

// Motivos tipificados de denuncia (esquema §6, módulo 9).
export const MOTIVOS_REPORTE = [
  'fraude',
  'duplicado',
  'datos_falsos',
  'ya_vendido',
  'inapropiado',
  'otro',
] as const;
export type MotivoReporte = (typeof MOTIVOS_REPORTE)[number];

export const ESTADOS_REPORTE = ['abierto', 'resuelto'] as const;
export type EstadoReporteStr = (typeof ESTADOS_REPORTE)[number];

// Reportar un anuncio no requiere cuenta (botón en la ficha).
export const reporteCrearSchema = z.object({
  vehiculoId: z.number().int().positive(),
  motivo: z.enum(MOTIVOS_REPORTE),
  detalle: z.string().trim().max(500).optional(),
});

export type ReporteCrearInput = z.infer<typeof reporteCrearSchema>;

export const adminReportesFiltrosSchema = z.object({
  estado: z.enum(ESTADOS_REPORTE).optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});

export type AdminReportesFiltros = z.infer<typeof adminReportesFiltrosSchema>;
