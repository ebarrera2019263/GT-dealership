'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';

interface Metricas {
  activos: number;
  pendientes: number;
  vendidos: number;
  usuarios: number;
  leadsMes: number;
  topMarcas: { nombre: string; total: number }[];
  publicacionesPorMes: { mes: string; total: number }[];
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function etiquetaMes(mes: string): string {
  const [, m] = mes.split('-');
  return MESES[Number(m) - 1] ?? mes;
}

export default function AdminDashboard() {
  const { fetchAuth } = useAuth();
  const [m, setM] = useState<Metricas | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/admin/metricas');
    if (res.ok) setM(await res.json());
    else setError('No se pudieron cargar las métricas');
  }, [fetchAuth]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!m) return <p className="text-sm text-musgo">Cargando métricas…</p>;

  const maxSerie = Math.max(1, ...m.publicacionesPorMes.map((p) => p.total));
  const maxMarca = Math.max(1, ...m.topMarcas.map((t) => t.total));

  const kpis: { etiqueta: string; valor: number }[] = [
    { etiqueta: 'Anuncios activos', valor: m.activos },
    { etiqueta: 'Pendientes', valor: m.pendientes },
    { etiqueta: 'Vendidos', valor: m.vendidos },
    { etiqueta: 'Usuarios', valor: m.usuarios },
    { etiqueta: 'Leads del mes', valor: m.leadsMes },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-musgo">Resumen operativo del marketplace.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.etiqueta} className="rounded-lg border border-borde bg-white p-4">
            <p className="cifra text-3xl font-bold">{k.valor.toLocaleString('es-GT')}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-musgo">{k.etiqueta}</p>
          </div>
        ))}
      </div>

      {m.pendientes > 0 && (
        <Link
          href="/admin/moderacion"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-quetzal bg-crema px-4 py-2 text-sm font-medium text-quetzal hover:bg-white"
        >
          {m.pendientes} anuncio{m.pendientes === 1 ? '' : 's'} esperando revisión →
        </Link>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-borde bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-musgo">
            Publicaciones por mes
          </h2>
          <div className="mt-4 flex h-40 items-end gap-2">
            {m.publicacionesPorMes.map((p) => (
              <div key={p.mes} className="flex flex-1 flex-col items-center gap-1">
                <span className="cifra text-xs text-musgo">{p.total}</span>
                <div
                  className="w-full rounded-t bg-quetzal"
                  style={{ height: `${(p.total / maxSerie) * 100}%`, minHeight: p.total ? 4 : 0 }}
                />
                <span className="text-xs text-musgo">{etiquetaMes(p.mes)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-borde bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-musgo">
            Top marcas publicadas
          </h2>
          {m.topMarcas.length === 0 ? (
            <p className="mt-4 text-sm text-musgo">Todavía no hay anuncios publicados.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {m.topMarcas.map((t) => (
                <li key={t.nombre} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-sm">{t.nombre}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-crema">
                    <div
                      className="h-full rounded bg-quetzal"
                      style={{ width: `${(t.total / maxMarca) * 100}%` }}
                    />
                  </div>
                  <span className="cifra w-8 shrink-0 text-right text-sm text-musgo">
                    {t.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
