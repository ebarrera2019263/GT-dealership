import { PrismaClient } from '@prisma/client';

export const BASE = process.env.TEST_API_URL ?? 'http://localhost:3099/api';

// PrismaClient contra la BD de test (DATABASE_URL viene de vitest.config env).
export const prisma = new PrismaClient();

let contador = 0;
export function uid(): string {
  return `${Date.now()}_${contador++}`;
}

export type Rol = 'comprador' | 'vendedor' | 'concesionario';
export interface Sesion {
  id: number;
  token: string;
  email: string;
}

export async function registrar(rol: Rol = 'comprador'): Promise<Sesion> {
  const email = `test_${rol}_${uid()}@test.gt`;
  const res = await fetch(`${BASE}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: `T ${rol}`, email, password: 'password123', rol }),
  });
  if (!res.ok) throw new Error(`registro ${rol} falló: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return { id: body.usuario.id, token: body.accessToken, email };
}

/**
 * Sesión con rol admin. El registro público no permite 'admin', así que se
 * registra un usuario, se promueve en la BD y se re-loguea para que el nuevo
 * JWT lleve el claim rol=admin (el guard lee el rol del token).
 */
export async function crearAdmin(): Promise<Sesion> {
  const s = await registrar('comprador');
  await prisma.usuario.update({ where: { id: s.id }, data: { rol: 'admin' } });
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: s.email, password: 'password123' }),
  });
  if (!res.ok) throw new Error(`login admin falló: ${res.status}`);
  const body = await res.json();
  return { id: s.id, token: body.accessToken, email: s.email };
}

interface ReqOpts {
  token?: string;
  method?: string;
  body?: unknown;
}

export function req(ruta: string, opts: ReqOpts = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  return fetch(`${BASE}${ruta}`, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

// FK válidas tomadas del catálogo sembrado (modelo trae marca; municipio trae
// departamento) para construir vehículos de prueba consistentes.
async function catalogoBase() {
  const [modelo, municipio, carroceria, transmision, combustible] = await Promise.all([
    prisma.modelo.findFirstOrThrow(),
    prisma.municipio.findFirstOrThrow(),
    prisma.carroceria.findFirstOrThrow(),
    prisma.transmision.findFirstOrThrow(),
    prisma.combustible.findFirstOrThrow(),
  ]);
  return {
    marcaId: modelo.marcaId,
    modeloId: modelo.id,
    carroceriaId: carroceria.id,
    transmisionId: transmision.id,
    combustibleId: combustible.id,
    departamentoId: municipio.departamentoId,
    municipioId: municipio.id,
  };
}

interface VehiculoOpts {
  estado?: 'borrador' | 'en_revision' | 'publicado' | 'pausado' | 'rechazado' | 'vendido';
  verificado?: boolean;
  precio?: number;
  anio?: number;
}

/** Crea un vehículo directamente en la BD (salta la moderación) para armar escenarios. */
export async function crearVehiculo(usuarioId: number, opts: VehiculoOpts = {}) {
  const cat = await catalogoBase();
  const precio = opts.precio ?? 50_000;
  return prisma.vehiculo.create({
    data: {
      ...cat,
      usuarioId,
      slug: `test-veh-${uid()}`,
      anio: opts.anio ?? 2022,
      precio,
      precioGtq: precio,
      kilometraje: 30_000,
      estado: opts.estado ?? 'publicado',
      verificado: opts.verificado ?? false,
      publicadoEn: (opts.estado ?? 'publicado') === 'publicado' ? new Date() : null,
    },
    select: { id: true, slug: true },
  });
}

/**
 * Deja las tablas transaccionales vacías preservando el catálogo maestro y la
 * config de financiamiento (sembrados). TRUNCATE … CASCADE arrastra a todo lo
 * que referencia usuarios/vehículos (citas, favoritos, leads, solicitudes, …).
 * Se llama en beforeAll de cada suite para partir de un estado limpio.
 */
export async function resetTransaccional() {
  await prisma.$executeRawUnsafe('TRUNCATE usuarios, vehiculos RESTART IDENTITY CASCADE');
}
