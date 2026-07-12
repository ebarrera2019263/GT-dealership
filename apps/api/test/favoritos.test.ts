import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Favoritos', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('agrega, lista y quita un favorito', async () => {
    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id);

    const add = await req('/favoritos', { token: comprador.token, body: { vehiculoId: veh.id } });
    expect([200, 201]).toContain(add.status);

    const { ids } = await (await req('/favoritos/ids', { token: comprador.token })).json();
    expect(ids).toContain(veh.id);

    const lista = await (await req('/favoritos', { token: comprador.token })).json();
    expect(lista.length).toBeGreaterThan(0);

    const del = await req(`/favoritos/${veh.id}`, { method: 'DELETE', token: comprador.token });
    expect([200, 204]).toContain(del.status);

    const despues = await (await req('/favoritos/ids', { token: comprador.token })).json();
    expect(despues.ids).not.toContain(veh.id);
  });

  it('requiere autenticación', async () => {
    const r = await req('/favoritos');
    expect(r.status).toBe(401);
  });
});
