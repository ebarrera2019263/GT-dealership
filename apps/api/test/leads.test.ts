import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Leads (contacto sin cuenta)', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('crea un lead público e incrementa los contactos del anuncio', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id);

    const r = await req('/leads', {
      body: { vehiculoId: veh.id, nombre: 'Interesado', telefono: '55551234' },
    });
    expect(r.status).toBe(201);

    const actualizado = await prisma.vehiculo.findUnique({
      where: { id: veh.id },
      select: { contactos: true },
    });
    expect(actualizado?.contactos).toBe(1);
  });

  it('exige al menos un medio de contacto (teléfono o email)', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id);

    const r = await req('/leads', { body: { vehiculoId: veh.id, nombre: 'Sin medio' } });
    expect(r.status).toBe(400);
  });

  it('no crea leads sobre anuncios no publicados', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id, { estado: 'borrador' });

    const r = await req('/leads', {
      body: { vehiculoId: veh.id, nombre: 'Persona', telefono: '55550000' },
    });
    expect(r.status).toBe(404);
  });
});
