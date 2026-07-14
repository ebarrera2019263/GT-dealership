'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../../lib/auth';

interface Lead {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  canal: 'formulario' | 'whatsapp' | 'llamada';
  creadoEn: string;
  vehiculo: {
    id: number;
    slug: string;
    anio: number;
    marca: { nombre: string };
    modelo: { nombre: string };
    usuario: { nombre: string };
  };
}

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminLeadsPage() {
  const t = useT();
  const { fetchAuth } = useAuth();
  const [filas, setFilas] = useState<Lead[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async (desde: number | null, reset: boolean) => {
      setCargando(true);
      const params = new URLSearchParams();
      if (desde) params.set('cursor', String(desde));
      const res = await fetchAuth(`/admin/leads?${params.toString()}`);
      if (!res.ok) {
        setError(t('admin.leads.loadError'));
        setCargando(false);
        return;
      }
      const data = await res.json();
      setFilas((prev) => (reset ? data.resultados : [...prev, ...data.resultados]));
      setCursor(data.siguienteCursor);
      setError('');
      setCargando(false);
    },
    [fetchAuth, t],
  );

  useEffect(() => {
    void cargar(null, true);
  }, [cargar]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">{t('admin.leads.title')}</h1>
      <p className="mt-1 text-sm text-musgo">{t('admin.leads.subtitle')}</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-borde bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-borde text-left text-xs uppercase tracking-wide text-musgo">
            <tr>
              <th className="px-3 py-2 font-semibold">{t('admin.leads.colDate')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.leads.colInterested')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.leads.colContact')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.leads.colChannel')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.leads.colListing')}</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((l) => (
              <tr key={l.id} className="border-b border-borde last:border-0">
                <td className="cifra whitespace-nowrap px-3 py-2 text-musgo">
                  {fecha(l.creadoEn)}
                </td>
                <td className="px-3 py-2 font-medium">{l.nombre}</td>
                <td className="cifra px-3 py-2 text-musgo">{l.telefono ?? l.email ?? '—'}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-crema px-1.5 py-0.5 text-xs">{l.canal}</span>
                </td>
                <td className="px-3 py-2">
                  <a href={`/autos/${l.vehiculo.slug}`} className="hover:text-acento">
                    {l.vehiculo.marca.nombre} {l.vehiculo.modelo.nombre} {l.vehiculo.anio}
                  </a>
                  <span className="block text-xs text-musgo">
                    {t('admin.leads.sellerLabel', { nombre: l.vehiculo.usuario.nombre })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!cargando && filas.length === 0 && (
          <p className="p-8 text-center text-sm text-musgo">{t('admin.leads.empty')}</p>
        )}
      </div>

      {cursor && (
        <div className="mt-4 text-center">
          <button
            type="button"
            disabled={cargando}
            onClick={() => cargar(cursor, false)}
            className="rounded-md border border-tinta px-5 py-2 text-sm font-medium hover:bg-white disabled:opacity-60"
          >
            {cargando ? t('common.loading') : t('admin.leads.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
