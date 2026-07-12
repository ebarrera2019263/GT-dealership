import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Mensajería interna', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('el comprador inicia una conversación y el vendedor la ve como no leída', async () => {
    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id);

    const ini = await req('/conversaciones', {
      token: comprador.token,
      body: { vehiculoId: veh.id, contenido: '¿Sigue disponible?' },
    });
    expect([200, 201]).toContain(ini.status);
    const { id } = await ini.json();
    expect(id).toBeGreaterThan(0);

    const noLeidos = await (
      await req('/conversaciones/no-leidos', { token: vendedor.token })
    ).json();
    expect(noLeidos.total).toBeGreaterThanOrEqual(1);

    // El vendedor responde.
    const resp = await req(`/conversaciones/${id}/mensajes`, {
      token: vendedor.token,
      body: { contenido: 'Sí, disponible.' },
    });
    expect([200, 201]).toContain(resp.status);

    // Ahora el comprador tiene la respuesta sin leer.
    const noLeidosComprador = await (
      await req('/conversaciones/no-leidos', { token: comprador.token })
    ).json();
    expect(noLeidosComprador.total).toBeGreaterThanOrEqual(1);
  });

  it('el dueño no puede iniciar una conversación sobre su propio anuncio', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id);

    const r = await req('/conversaciones', {
      token: vendedor.token,
      body: { vehiculoId: veh.id, contenido: 'hola' },
    });
    expect(r.status).toBeGreaterThanOrEqual(400);
  });
});
