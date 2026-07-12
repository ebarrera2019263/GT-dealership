import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BASE, prisma, registrar, req, resetTransaccional } from './helpers';

describe('Auth y autorización', () => {
  beforeAll(resetTransaccional);
  afterAll(() => prisma.$disconnect());

  it('registra un usuario y devuelve tokens', async () => {
    const s = await registrar('comprador');
    expect(s.id).toBeGreaterThan(0);
    expect(typeof s.token).toBe('string');
  });

  it('rechaza registrar el mismo email dos veces', async () => {
    const email = `dup_${Date.now()}@test.gt`;
    const payload = { nombre: 'Dup', email, password: 'password123', rol: 'comprador' };
    const r1 = await fetch(`${BASE}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(r1.status).toBe(201);
    const r2 = await fetch(`${BASE}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect([400, 409]).toContain(r2.status);
  });

  it('permite login con credenciales correctas y rechaza las malas', async () => {
    const email = `login_${Date.now()}@test.gt`;
    await fetch(`${BASE}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Login', email, password: 'password123', rol: 'comprador' }),
    });

    const ok = await req('/auth/login', { body: { email, password: 'password123' } });
    expect(ok.status).toBe(200);
    const cuerpo = await ok.json();
    expect(typeof cuerpo.accessToken).toBe('string');

    const mal = await req('/auth/login', { body: { email, password: 'incorrecta' } });
    expect(mal.status).toBe(401);
  });

  it('bloquea una ruta protegida sin token (401)', async () => {
    const r = await req('/citas');
    expect(r.status).toBe(401);
  });

  it('aplica @Roles: un comprador no accede a una ruta de admin (403)', async () => {
    const comprador = await registrar('comprador');
    const r = await req('/busquedas/procesar-alertas', {
      method: 'POST',
      token: comprador.token,
    });
    expect(r.status).toBe(403);
  });
});
