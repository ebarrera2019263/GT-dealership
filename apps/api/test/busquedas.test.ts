import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearAdmin, crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Búsquedas guardadas y alertas', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('guarda una búsqueda y la lista con conteo de novedades', async () => {
    const comprador = await registrar('comprador');
    const crear = await req('/busquedas', { token: comprador.token, body: { criterios: {} } });
    expect(crear.status).toBe(201);

    const lista = await (await req('/busquedas', { token: comprador.token })).json();
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBe(1);
    expect(lista[0]).toHaveProperty('novedades');
    expect(lista[0]).toHaveProperty('alertaActiva');
  });

  it('procesar-alertas avisa cuando hay anuncios nuevos desde la última vez', async () => {
    const comprador = await registrar('comprador');
    const vendedor = await registrar('vendedor');

    const crear = await req('/busquedas', { token: comprador.token, body: { criterios: {} } });
    const { id } = await crear.json();

    // Movemos la línea base al pasado para que lo nuevo cuente como novedad.
    await prisma.busquedaGuardada.update({
      where: { id },
      data: { ultimaNotificacion: new Date(Date.now() - 3600_000) },
    });

    // Un anuncio publicado ahora (posterior a la línea base).
    await crearVehiculo(vendedor.id, { estado: 'publicado' });

    const admin = await crearAdmin();
    const r = await req('/busquedas/procesar-alertas', { method: 'POST', token: admin.token });
    expect(r.status).toBe(200);
    const resumen = await r.json();
    expect(resumen.revisadas).toBeGreaterThanOrEqual(1);
    expect(resumen.avisadas).toBeGreaterThanOrEqual(1);
  });

  it('un no-admin no puede procesar alertas', async () => {
    const comprador = await registrar('comprador');
    const r = await req('/busquedas/procesar-alertas', { method: 'POST', token: comprador.token });
    expect(r.status).toBe(403);
  });
});
