'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../../lib/auth';
import { formatearPrecio } from '../../../lib/formato';

interface Fila {
  id: number;
  slug: string;
  anio: number;
  version: string | null;
  precio: string;
  moneda: 'GTQ' | 'USD';
  estado: string;
  verificado: boolean;
  destacado: boolean;
  vistas: number;
  contactos: number;
  marca: { nombre: string };
  modelo: { nombre: string };
  usuario: { id: number; nombre: string; email: string };
}

const ESTADOS = [
  'borrador',
  'en_revision',
  'publicado',
  'rechazado',
  'pausado',
  'expirado',
  'vendido',
] as const;

const ESTADO_CLASE: Record<string, string> = {
  borrador: 'bg-crema text-musgo',
  en_revision: 'bg-amber-100 text-amber-800',
  publicado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
  pausado: 'bg-crema text-musgo',
  expirado: 'bg-crema text-musgo',
  vendido: 'bg-tinta text-white',
};

export default function AdminVehiculosPage() {
  const t = useT();
  const { fetchAuth } = useAuth();
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [estado, setEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Carga una página; si `reset`, reemplaza la lista (cambio de filtro).
  const cargar = useCallback(
    async (desde: number | null, reset: boolean) => {
      setCargando(true);
      const params = new URLSearchParams();
      if (estado) params.set('estado', estado);
      if (desde) params.set('cursor', String(desde));
      const res = await fetchAuth(`/admin/vehiculos?${params.toString()}`);
      if (!res.ok) {
        setError(t('admin.vehiculos.loadError'));
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

  // Recarga desde cero al montar y cada vez que cambia el filtro de estado.
  useEffect(() => {
    void cargar(null, true);
  }, [cargar]);

  async function alternar(fila: Fila, campo: 'verificado' | 'destacado') {
    const valor = !fila[campo];
    setFilas((xs) => xs.map((x) => (x.id === fila.id ? { ...x, [campo]: valor } : x)));
    const accion = campo === 'verificado' ? 'verificar' : 'destacar';
    const res = await fetchAuth(`/admin/vehiculos/${fila.id}/${accion}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor }),
    });
    if (!res.ok) {
      setFilas((xs) => xs.map((x) => (x.id === fila.id ? { ...x, [campo]: !valor } : x)));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {t('admin.vehiculos.title')}
      </h1>
      <p className="mt-1 text-sm text-musgo">{t('admin.vehiculos.subtitle')}</p>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm text-musgo" htmlFor="filtro-estado">
          {t('admin.vehiculos.state')}
        </label>
        <select
          id="filtro-estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
        >
          <option value="">{t('admin.vehiculos.all')}</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {t(`admin.vehiculos.estado.${e}`)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-borde bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-borde text-left text-xs uppercase tracking-wide text-musgo">
            <tr>
              <th className="px-3 py-2 font-semibold">{t('admin.vehiculos.colListing')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.vehiculos.colPrice')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.vehiculos.colState')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.vehiculos.colSeller')}</th>
              <th className="px-3 py-2 text-right font-semibold">
                {t('admin.vehiculos.colViewsContacts')}
              </th>
              <th className="px-3 py-2 text-center font-semibold">
                {t('admin.vehiculos.colVerified')}
              </th>
              <th className="px-3 py-2 text-center font-semibold">
                {t('admin.vehiculos.colFeatured')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((v) => {
              const estadoClase = ESTADO_CLASE[v.estado] ?? 'bg-crema text-musgo';
              return (
                <tr key={v.id} className="border-b border-borde last:border-0">
                  <td className="px-3 py-2">
                    <a href={`/autos/${v.slug}`} className="font-medium hover:text-acento">
                      {v.marca.nombre} {v.modelo.nombre} {v.anio}
                    </a>
                    {v.version && <span className="text-musgo"> · {v.version}</span>}
                  </td>
                  <td className="cifra whitespace-nowrap px-3 py-2">
                    {formatearPrecio(v.precio, v.moneda)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${estadoClase}`}
                    >
                      {t(`admin.vehiculos.estado.${v.estado}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span title={v.usuario.email}>{v.usuario.nombre}</span>
                  </td>
                  <td className="cifra whitespace-nowrap px-3 py-2 text-right text-musgo">
                    {v.vistas.toLocaleString('es-GT')} · {v.contactos}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => alternar(v, 'verificado')}
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        v.verificado
                          ? 'border-acento bg-acento text-white'
                          : 'border-borde text-musgo hover:border-acento hover:text-acento'
                      }`}
                    >
                      {v.verificado ? `✓ ${t('admin.vehiculos.yes')}` : t('admin.vehiculos.no')}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => alternar(v, 'destacado')}
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        v.destacado
                          ? 'border-acento bg-acento text-white'
                          : 'border-borde text-musgo hover:border-acento hover:text-acento'
                      }`}
                    >
                      {v.destacado ? `★ ${t('admin.vehiculos.yes')}` : t('admin.vehiculos.no')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!cargando && filas.length === 0 && (
          <p className="p-8 text-center text-sm text-musgo">{t('admin.vehiculos.empty')}</p>
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
            {cargando ? t('common.loading') : t('admin.vehiculos.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
