import { z } from 'zod';

// A qué anuncios aplica un plan (espeja el enum AplicaA de Prisma).
export const APLICA_A = ['todos', 'verificados', 'concesionario'] as const;
export type AplicaA = (typeof APLICA_A)[number];

export const simulacionSchema = z
  .object({
    precio: z.number().positive(),
    enganche: z.number().min(0),
    plazo: z.number().int().min(6).max(120),
    tasaAnual: z.number().positive().max(100),
  })
  .refine((d) => d.enganche < d.precio, {
    message: 'El enganche debe ser menor al precio',
    path: ['enganche'],
  });

export type SimulacionInput = z.infer<typeof simulacionSchema>;

/**
 * Cuota nivelada (esquema §3.5). La usan front (simulador instantáneo) y
 * back (fuente de verdad al guardar una solicitud):
 *
 *   cuota = P · i / (1 − (1 + i)^−n)
 */
export function calcularCuotaNivelada(input: SimulacionInput): number {
  const { precio, enganche, plazo, tasaAnual } = input;
  const principal = precio - enganche;
  const tasaMensual = tasaAnual / 100 / 12;
  if (tasaMensual === 0) {
    return redondearCentavos(principal / plazo);
  }
  const cuota = (principal * tasaMensual) / (1 - (1 + tasaMensual) ** -plazo);
  return redondearCentavos(cuota);
}

function redondearCentavos(monto: number): number {
  return Math.round(monto * 100) / 100;
}

// ─────────────── Admin: entidades y planes (esquema §5.4, §6 módulo 6) ───────────────

export const entidadFinancieraCrearSchema = z.object({
  nombre: z.string().trim().min(1).max(80),
  logoUrl: z.string().url().max(300).optional(),
});

export type EntidadFinancieraCrearInput = z.infer<typeof entidadFinancieraCrearSchema>;

export const entidadFinancieraActualizarSchema = z.object({
  nombre: z.string().trim().min(1).max(80).optional(),
  logoUrl: z.string().url().max(300).nullable().optional(),
  activo: z.boolean().optional(),
});

export type EntidadFinancieraActualizarInput = z.infer<typeof entidadFinancieraActualizarSchema>;

// Base común de un plan; el refine de plazos se aplica en crear (campos requeridos).
const planCampos = {
  nombre: z.string().trim().min(1).max(80),
  tasaAnual: z.number().positive().max(100),
  plazoMin: z.number().int().min(6).max(120),
  plazoMax: z.number().int().min(6).max(120),
  engancheMinPct: z.number().min(0).max(90),
  aplicaA: z.enum(APLICA_A).default('todos'),
  requisitos: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
};

export const planFinanciamientoCrearSchema = z
  .object({ entidadId: z.number().int().positive(), ...planCampos })
  .refine((d) => d.plazoMax >= d.plazoMin, {
    message: 'El plazo máximo debe ser mayor o igual al mínimo',
    path: ['plazoMax'],
  });

export type PlanFinanciamientoCrearInput = z.infer<typeof planFinanciamientoCrearSchema>;

export const planFinanciamientoActualizarSchema = z
  .object({
    nombre: planCampos.nombre.optional(),
    tasaAnual: planCampos.tasaAnual.optional(),
    plazoMin: planCampos.plazoMin.optional(),
    plazoMax: planCampos.plazoMax.optional(),
    engancheMinPct: planCampos.engancheMinPct.optional(),
    aplicaA: z.enum(APLICA_A).optional(),
    requisitos: planCampos.requisitos,
    activo: z.boolean().optional(),
  })
  .refine((d) => d.plazoMin === undefined || d.plazoMax === undefined || d.plazoMax >= d.plazoMin, {
    message: 'El plazo máximo debe ser mayor o igual al mínimo',
    path: ['plazoMax'],
  });

export type PlanFinanciamientoActualizarInput = z.infer<typeof planFinanciamientoActualizarSchema>;

// ─────────────── Solicitudes de crédito (esquema §5.4, §6 módulo 6) ───────────────

export const ESTADOS_SOLICITUD = ['enviada', 'en_revision', 'aprobada', 'rechazada'] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

// El comprador manda su simulación; el server recalcula la cuota como fuente
// de verdad (no confía en el número del cliente).
export const solicitudCreditoCrearSchema = z.object({
  vehiculoId: z.number().int().positive(),
  planId: z.number().int().positive(),
  enganche: z.number().min(0),
  plazo: z.number().int().min(6).max(120),
});

export type SolicitudCreditoCrearInput = z.infer<typeof solicitudCreditoCrearSchema>;

export const solicitudEstadoSchema = z.object({
  estado: z.enum(ESTADOS_SOLICITUD),
});

export type SolicitudEstadoInput = z.infer<typeof solicitudEstadoSchema>;

export const adminSolicitudesFiltrosSchema = z.object({
  estado: z.enum(ESTADOS_SOLICITUD).optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});

export type AdminSolicitudesFiltros = z.infer<typeof adminSolicitudesFiltrosSchema>;
