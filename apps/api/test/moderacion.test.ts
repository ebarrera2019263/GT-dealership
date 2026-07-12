import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearAdmin, crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Moderación de anuncios', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('un anuncio en revisión aparece en la cola y el admin lo aprueba', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id, { estado: 'en_revision' });
    const admin = await crearAdmin();

    const cola = await (await req('/admin/moderacion/pendientes', { token: admin.token })).json();
    expect(cola.some((v: { id: number }) => v.id === veh.id)).toBe(true);

    const r = await req(`/admin/vehiculos/${veh.id}/estado`, {
      method: 'PATCH',
      token: admin.token,
      body: { accion: 'aprobar' },
    });
    expect(r.status).toBe(200);

    const enBd = await prisma.vehiculo.findUnique({
      where: { id: veh.id },
      select: { estado: true, publicadoEn: true },
    });
    expect(enBd?.estado).toBe('publicado');
    expect(enBd?.publicadoEn).toBeTruthy();
  });

  it('el rechazo exige motivo (validación Zod)', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id, { estado: 'en_revision' });
    const admin = await crearAdmin();

    const r = await req(`/admin/vehiculos/${veh.id}/estado`, {
      method: 'PATCH',
      token: admin.token,
      body: { accion: 'rechazar' },
    });
    expect(r.status).toBe(400);
  });

  it('un vendedor no puede moderar (403)', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id, { estado: 'en_revision' });

    const r = await req(`/admin/vehiculos/${veh.id}/estado`, {
      method: 'PATCH',
      token: vendedor.token,
      body: { accion: 'aprobar' },
    });
    expect(r.status).toBe(403);
  });
});
