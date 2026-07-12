import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { crearVehiculo, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Vehículos (listado público y ficha)', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('el listado público muestra los publicados y oculta los borradores', async () => {
    const vendedor = await registrar('vendedor');
    const pub = await crearVehiculo(vendedor.id, { estado: 'publicado' });
    const borrador = await crearVehiculo(vendedor.id, { estado: 'borrador' });

    const r = await req('/vehiculos?limite=50');
    expect(r.status).toBe(200);
    const { resultados } = await r.json();
    const ids = resultados.map((v: { id: number }) => v.id);
    expect(ids).toContain(pub.id);
    expect(ids).not.toContain(borrador.id);
  });

  it('la ficha por slug no expone datos privados (VIN ni placa)', async () => {
    const vendedor = await registrar('vendedor');
    const veh = await crearVehiculo(vendedor.id, { estado: 'publicado' });
    // Le ponemos datos privados directamente en la BD.
    await prisma.vehiculo.update({
      where: { id: veh.id },
      data: { vin: 'VIN123SECRETO', placaParcial: 'P-123' },
    });

    const r = await req(`/vehiculos/${veh.slug}`);
    expect(r.status).toBe(200);
    const ficha = await r.json();
    expect(ficha.id).toBe(veh.id);
    expect(ficha).not.toHaveProperty('vin');
    expect(ficha).not.toHaveProperty('placaParcial');
    expect(JSON.stringify(ficha)).not.toContain('VIN123SECRETO');
    // El precio normalizado en quetzales sí debe venir.
    expect(ficha.precioGtq ?? ficha.precio).toBeTruthy();
  });

  it('devuelve 404 para un slug inexistente', async () => {
    const r = await req('/vehiculos/no-existe-jamas');
    expect(r.status).toBe(404);
  });
});
