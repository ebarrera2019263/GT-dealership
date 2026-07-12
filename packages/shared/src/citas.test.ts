import { describe, expect, it } from 'vitest';
import { citaCrearSchema } from './citas';

const enDias = (d: number) => new Date(Date.now() + d * 24 * 3600 * 1000).toISOString();

describe('citaCrearSchema', () => {
  it('acepta una fecha futura', () => {
    const r = citaCrearSchema.safeParse({ vehiculoId: 1, fecha: enDias(2) });
    expect(r.success).toBe(true);
  });

  it('rechaza una fecha pasada', () => {
    const r = citaCrearSchema.safeParse({ vehiculoId: 1, fecha: enDias(-1) });
    expect(r.success).toBe(false);
  });

  it('coacciona el string ISO a Date', () => {
    const r = citaCrearSchema.safeParse({ vehiculoId: 1, fecha: enDias(3) });
    expect(r.success && r.data.fecha instanceof Date).toBe(true);
  });

  it('exige vehiculoId positivo', () => {
    expect(citaCrearSchema.safeParse({ vehiculoId: 0, fecha: enDias(1) }).success).toBe(false);
  });
});
