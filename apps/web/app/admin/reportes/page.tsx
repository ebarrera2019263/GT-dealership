'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../../lib/auth';

interface Reporte {
  id: number;
  motivo: string;
  detalle: string | null;
  estado: 'abierto' | 'resuelto';
  creadoEn: string;
  vehiculo: {
    id: number;
    slug: string;
    anio: number;
    estado: string;
    marca: { nombre: string };
    modelo: { nombre: string };
  };
}

export default function AdminReportesPage() {
  const t = useT();
  const { fetchAuth } = useAuth();
  const [filas, setFilas] = useState<Reporte[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [estado, setEstado] = useState('abierto');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async (desde: number | null, reset: boolean) => {
      setCargando(true);
      const params = new URLSearchParams();
      if (estado) params.set('estado', estado);
      if (desde) params.set('cursor', String(desde));
      const res = await fetchAuth(`/admin/reportes?${params.toString()}`);
      if (!res.ok) {
        setError(t('admin.reportes.loadError'));
        setCargando(false);
        return;
      }
      const data = await res.json();
      setFilas((prev) => (reset ? data.resultados : [...prev, ...data.resultados]));
      setCursor(data.siguienteCursor);
      setError('');
      setCargando(false);
    },
    [estado, fetchAuth, t],
  );

  useEffect(() => {
    void cargar(null, true);
  }, [cargar]);

  async function resolver(id: number) {
    setFilas((xs) => xs.filter((x) => x.id !== id));
    const res = await fetchAuth(`/admin/reportes/${id}/resolver`, { method: 'PATCH' });
    if (!res.ok) {
      setError(t('admin.reportes.resolveError'));
      void cargar(null, true);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {t('admin.reportes.title')}
      </h1>
      <p className="mt-1 text-sm text-musgo">{t('admin.reportes.subtitle')}</p>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm text-musgo" htmlFor="filtro-estado">
          {t('admin.reportes.state')}
        </label>
        <select
          id="filtro-estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
        >
          <option value="abierto">{t('admin.reportes.open')}</option>
          <option value="resuelto">{t('admin.reportes.resolved')}</option>
          <option value="">{t('admin.reportes.all')}</option>
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <ul className="mt-4 flex flex-col gap-3">
        {filas.map((r) => (
          <li key={r.id} className="rounded-lg border border-borde bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
                    {t(`admin.reportes.motivo.${r.motivo}`)}
                  </span>
                  {r.estado === 'resuelto' && (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                      {t('admin.reportes.resolvedTag')}
                    </span>
                  )}
                </div>
                <a
                  href={`/autos/${r.vehiculo.slug}`}
                  className="mt-1 block font-medium hover:text-acento"
                >
                  {r.vehiculo.marca.nombre} {r.vehiculo.modelo.nombre} {r.vehiculo.anio}
                </a>
                <p className="cifra text-xs text-musgo">
                  {t('admin.reportes.listingNum', { id: r.vehiculo.id, estado: r.vehiculo.estado })}
                </p>
                {r.detalle && <p className="mt-2 text-sm text-musgo">{r.detalle}</p>}
              </div>
              {r.estado === 'abierto' && (
                <button
                  type="button"
                  onClick={() => resolver(r.id)}
                  className="shrink-0 rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-white hover:bg-acento-oscuro"
                >
                  {t('admin.reportes.markResolved')}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {!cargando && filas.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          {t('admin.reportes.empty')}
        </div>
      )}

      {cursor && (
        <div className="mt-4 text-center">
          <button
            type="button"
            disabled={cargando}
            onClick={() => cargar(cursor, false)}
            className="rounded-md border border-tinta px-5 py-2 text-sm font-medium hover:bg-white disabled:opacity-60"
          >
            {cargando ? t('common.loading') : t('admin.reportes.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
