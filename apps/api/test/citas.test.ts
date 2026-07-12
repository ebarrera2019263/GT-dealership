import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

const enDias = (d: number) => new Date(Date.now() + d * 24 * 3600 * 1000).toISOString();

describe('Citas / visitas', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('el comprador agenda una visita a un anuncio publicado', async () => {
    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id);

    const r = await req('/citas', {
      token: comprador.token,
      body: { vehiculoId: veh.id, fecha: enDias(2) },
    });
    expect(r.status).toBe(201);
    const cita = await r.json();
    expect(cita.estado).toBe('pendiente');
  });

  it('no permite agendar a tu propio anuncio ni duplicar una visita activa', async () => {
    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id);

    const propio = await req('/citas', {
      token: vendedor.token,
      body: { vehiculoId: veh.id, fecha: enDias(2) },
    });
    expect(propio.status).toBe(400);

    const uno = await req('/citas', {
      token: comprador.token,
      body: { vehiculoId: veh.id, fecha: enDias(2) },
    });
    expect(uno.status).toBe(201);
    const dup = await req('/citas', {
      token: comprador.token,
      body: { vehiculoId: veh.id, fecha: enDias(3) },
    });
    expect(dup.status).toBe(400);
  });

  it('rechaza fechas pasadas y anuncios inexistentes', async () => {
    const comprador = await registrar('comprador');
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id);

    const pasada = await req('/citas', {
      token: comprador.token,
      body: { vehiculoId: veh.id, fecha: enDias(-1) },
    });
    expect(pasada.status).toBe(400);

    const inexistente = await req('/citas', {
      token: comprador.token,
      body: { vehiculoId: 999_999, fecha: enDias(1) },
    });
    expect(inexistente.status).toBe(404);
  });

  it('máquina de estados: vendedor confirma, y solo el dueño puede', async () => {
    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id);

    const creada = await req('/citas', {
      token: comprador.token,
      body: { vehiculoId: veh.id, fecha: enDias(2) },
    });
    const { id } = await creada.json();

    // El comprador NO puede confirmar.
    const noAutz = await req(`/citas/${id}/confirmar`, { method: 'PATCH', token: comprador.token });
    expect(noAutz.status).toBe(404);

    // El vendedor sí.
    const conf = await req(`/citas/${id}/confirmar`, { method: 'PATCH', token: vendedor.token });
    expect(conf.status).toBe(200);
    expect((await conf.json()).estado).toBe('confirmada');

    // Reconfirmar es inválido.
    const otra = await req(`/citas/${id}/confirmar`, { method: 'PATCH', token: vendedor.token });
    expect(otra.status).toBe(400);
  });

  it('el comprador cancela su visita y aparece en ambos listados', async () => {
    const vendedor = await registrar('vendedor');
    const comprador = await registrar('comprador');
    const veh = await crearVehiculo(vendedor.id);

    const creada = await req('/citas', {
      token: comprador.token,
      body: { vehiculoId: veh.id, fecha: enDias(2) },
    });
    const { id } = await creada.json();

    const mias = await (await req('/citas', { token: comprador.token })).json();
    expect(mias.some((c: { id: number }) => c.id === id)).toBe(true);

    const recibidas = await (await req('/citas/recibidas', { token: vendedor.token })).json();
    const recibida = recibidas.find((c: { id: number }) => c.id === id);
    expect(recibida).toBeTruthy();
    expect(recibida.comprador.nombre).toContain('comprador');

    const cancel = await req(`/citas/${id}/cancelar`, { method: 'PATCH', token: comprador.token });
    expect(cancel.status).toBe(200);
    expect((await cancel.json()).estado).toBe('cancelada');
  });
});
