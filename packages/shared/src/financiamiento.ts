import { z } from 'zod';

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
