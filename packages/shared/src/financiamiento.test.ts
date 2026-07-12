import { describe, expect, it } from 'vitest';
import {
  calcularCuotaNivelada,
  planFinanciamientoCrearSchema,
  simulacionSchema,
  solicitudCreditoCrearSchema,
} from './financiamiento';

describe('calcularCuotaNivelada', () => {
  it('calcula la cuota nivelada con la fórmula P·i/(1−(1+i)^−n)', () => {
    // 80 000 a 48 meses al 12% anual → ~2106.71 (verificado con calculadora).
    const cuota = calcularCuotaNivelada({
      precio: 100_000,
      enganche: 20_000,
      plazo: 48,
      tasaAnual: 12,
    });
    expect(cuota).toBeCloseTo(2106.71, 2);
  });

  it('reparte el principal en partes iguales cuando la tasa es 0', () => {
    const cuota = calcularCuotaNivelada({
      precio: 12_000,
      enganche: 0,
      plazo: 12,
      tasaAnual: 0,
    });
    expect(cuota).toBe(1000);
  });

  it('redondea a centavos', () => {
    const cuota = calcularCuotaNivelada({
      precio: 55_555,
      enganche: 5_555,
      plazo: 36,
      tasaAnual: 9.5,
    });
    // dos decimales, no más
    expect(cuota).toBe(Math.round(cuota * 100) / 100);
  });

  it('a mayor enganche, menor cuota', () => {
    const base = { precio: 100_000, plazo: 36, tasaAnual: 10 };
    const poco = calcularCuotaNivelada({ ...base, enganche: 10_000 });
    const mucho = calcularCuotaNivelada({ ...base, enganche: 40_000 });
    expect(mucho).toBeLessThan(poco);
  });
});

describe('simulacionSchema', () => {
  it('rechaza enganche mayor o igual al precio', () => {
    const r = simulacionSchema.safeParse({
      precio: 50_000,
      enganche: 50_000,
      plazo: 24,
      tasaAnual: 10,
    });
    expect(r.success).toBe(false);
  });

  it('acepta una simulación válida', () => {
    const r = simulacionSchema.safeParse({
      precio: 50_000,
      enganche: 10_000,
      plazo: 24,
      tasaAnual: 10,
    });
    expect(r.success).toBe(true);
  });

  it('rechaza plazos fuera de rango', () => {
    expect(
      simulacionSchema.safeParse({ precio: 50_000, enganche: 0, plazo: 3, tasaAnual: 10 }).success,
    ).toBe(false);
  });
});

describe('planFinanciamientoCrearSchema', () => {
  it('rechaza plazoMax menor que plazoMin', () => {
    const r = planFinanciamientoCrearSchema.safeParse({
      entidadId: 1,
      nombre: 'Plan X',
      tasaAnual: 12,
      plazoMin: 48,
      plazoMax: 24,
      engancheMinPct: 10,
    });
    expect(r.success).toBe(false);
  });
});

describe('solicitudCreditoCrearSchema', () => {
  it('exige ids positivos', () => {
    const r = solicitudCreditoCrearSchema.safeParse({
      vehiculoId: 0,
      planId: 1,
      enganche: 5_000,
      plazo: 24,
    });
    expect(r.success).toBe(false);
  });
});
