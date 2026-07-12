'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';

interface BusquedaGuardada {
  id: number;
  criterios: Record<string, string | number>;
  alertaActiva: boolean;
  total: number;
  novedades: number;
}

// Etiquetas legibles para los criterios guardados (§5.2). Las claves espejan
// los filtros del listado, así que "Ver resultados" reconstruye la misma URL.
const ETIQUETAS: Record<string, string> = {
  marca: 'Marca',
  modelo: 'Modelo',
  carroceria: 'Carrocería',
  anioMin: 'Año desde',
  anioMax: 'Año hasta',
  precioMin: 'Precio mín.',
  precioMax: 'Precio máx.',
  kmMax: 'Km máx.',
  transmisionId: 'Transmisión',
  combustibleId: 'Combustible',
  departamentoId: 'Departamento',
  orden: 'Orden',
};

function describir(criterios: Record<string, string | number>): string[] {
  return Object.entries(criterios)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${ETIQUETAS[k] ?? k}: ${v}`);
}

function urlResultados(criterios: Record<string, string | number>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(criterios)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  const qs = p.toString();
  return `/autos${qs ? `?${qs}` : ''}`;
}

export default function BusquedasPage() {
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [busquedas, setBusquedas] = useState<BusquedaGuardada[] | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/busquedas');
    if (res.ok) setBusquedas(await res.json());
  }, [fetchAuth]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/entrar?destino=/busquedas');
      return;
    }
    void cargar();
  }, [cargando, usuario, router, cargar]);

  async function alternarAlerta(b: BusquedaGuardada) {
    setBusquedas(
      (xs) => xs?.map((x) => (x.id === b.id ? { ...x, alertaActiva: !x.alertaActiva } : x)) ?? null,
    );
    const res = await fetchAuth(`/busquedas/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertaActiva: !b.alertaActiva }),
    });
    if (!res.ok) void cargar(); // revertir ante error
  }

  async function marcarVisto(id: number) {
    setBusquedas((xs) => xs?.map((x) => (x.id === id ? { ...x, novedades: 0 } : x)) ?? null);
    await fetchAuth(`/busquedas/${id}/visto`, { method: 'POST' });
  }

  async function eliminar(id: number) {
    setBusquedas((xs) => xs?.filter((x) => x.id !== id) ?? null);
    await fetchAuth(`/busquedas/${id}`, { method: 'DELETE' });
  }

  if (cargando || !usuario) {
    return <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Búsquedas guardadas</h1>
      <p className="mt-1 text-sm text-musgo">
        Guardá una búsqueda desde los filtros del listado y te avisamos cuándo hay anuncios nuevos.
      </p>

      {busquedas && busquedas.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          Todavía no guardaste ninguna búsqueda.
          <div>
            <Link
              href="/autos"
              className="mt-3 inline-block font-medium text-quetzal hover:underline"
            >
              Ir a buscar vehículos
            </Link>
          </div>
        </div>
      )}

      {busquedas && busquedas.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {busquedas.map((b) => {
            const chips = describir(b.criterios);
            return (
              <li key={b.id} className="rounded-lg border border-borde bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {chips.length > 0 ? (
                        chips.map((c) => (
                          <span key={c} className="rounded bg-crema px-2 py-0.5 text-xs text-tinta">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-musgo">Todos los vehículos</span>
                      )}
                    </div>
                    <p className="cifra mt-2 text-sm text-musgo">
                      {b.total.toLocaleString('es-GT')} resultados
                      {b.novedades > 0 && (
                        <span className="ml-2 rounded-full bg-quetzal px-2 py-0.5 text-xs font-semibold text-white">
                          {b.novedades} nuevo{b.novedades === 1 ? '' : 's'}
                        </span>
                      )}
                    </p>
                  </div>

                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-musgo">
                    <input
                      type="checkbox"
                      checked={b.alertaActiva}
                      onChange={() => alternarAlerta(b)}
                      className="accent-quetzal"
                    />
                    Alerta
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <Link
                    href={urlResultados(b.criterios)}
                    onClick={() => b.novedades > 0 && marcarVisto(b.id)}
                    className="rounded-md bg-quetzal px-3 py-1.5 font-medium text-white hover:bg-quetzal-oscuro"
                  >
                    Ver resultados
                  </Link>
                  {b.novedades > 0 && (
                    <button
                      type="button"
                      onClick={() => marcarVisto(b.id)}
                      className="rounded-md border border-borde px-3 py-1.5 hover:bg-crema"
                    >
                      Marcar como visto
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => eliminar(b.id)}
                    className="rounded-md border border-borde px-3 py-1.5 text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
