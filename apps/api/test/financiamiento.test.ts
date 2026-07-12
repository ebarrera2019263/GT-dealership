import { calcularCuotaNivelada } from '@concesionario/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearAdmin, crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Financiamiento', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('expone los planes públicos para el simulador (sin cuenta)', async () => {
    const r = await req('/financiamiento/planes');
    expect(r.status).toBe(200);
    const planes = await r.json();
    expect(Array.isArray(planes)).toBe(true);
    expect(planes.length).toBeGreaterThan(0);
  });

  it('crea una solicitud y el server recalcula la cuota como fuente de verdad', async () => {
    const planes = await (await req('/financiamiento/planes')).json();
    const plan = planes[0];

    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const precio = 80_000;
    const veh = await crearVehiculo(vendedor.id, { precio });

    const plazo = plan.plazoMin;
    const enganche = Math.ceil((precio * Number(plan.engancheMinPct)) / 100) + 1000;

    const r = await req('/solicitudes', {
      token: comprador.token,
      body: { vehiculoId: veh.id, planId: plan.id, enganche, plazo },
    });
    expect(r.status).toBe(201);
    const sol = await r.json();

    const esperada = calcularCuotaNivelada({
      precio,
      enganche,
      plazo,
      tasaAnual: Number(plan.tasaAnual),
    });
    expect(Number(sol.cuotaEstimada)).toBeCloseTo(esperada, 2);

    // Aparece en "mis solicitudes".
    const mias = await (await req('/solicitudes/mias', { token: comprador.token })).json();
    expect(mias.some?.((s: { id: number }) => s.id === sol.id) ?? mias.resultados?.length > 0).toBe(
      true,
    );
  });

  it('rechaza un enganche por debajo del mínimo del plan', async () => {
    const planes = await (await req('/financiamiento/planes')).json();
    const plan = planes.find((p: { engancheMinPct: unknown }) => Number(p.engancheMinPct) > 0);
    if (!plan) return; // ningún plan exige enganche mínimo; nada que probar

    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id, { precio: 80_000 });

    const r = await req('/solicitudes', {
      token: comprador.token,
      body: { vehiculoId: veh.id, planId: plan.id, enganche: 0, plazo: plan.plazoMin },
    });
    expect(r.status).toBe(400);
  });

  it('el admin cambia el estado de una solicitud', async () => {
    const planes = await (await req('/financiamiento/planes')).json();
    const plan = planes[0];
    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id, { precio: 80_000 });
    const enganche = Math.ceil((80_000 * Number(plan.engancheMinPct)) / 100) + 1000;

    const creada = await req('/solicitudes', {
      token: comprador.token,
      body: { vehiculoId: veh.id, planId: plan.id, enganche, plazo: plan.plazoMin },
    });
    const { id } = await creada.json();

    const admin = await crearAdmin();
    const r = await req(`/admin/solicitudes-credito/${id}/estado`, {
      method: 'PATCH',
      token: admin.token,
      body: { estado: 'aprobada' },
    });
    expect(r.status).toBe(200);

    const enBd = await prisma.solicitudCredito.findUnique({
      where: { id },
      select: { estado: true },
    });
    expect(enBd?.estado).toBe('aprobada');
  });
});
