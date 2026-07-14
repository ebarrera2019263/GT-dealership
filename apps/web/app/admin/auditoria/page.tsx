'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../../lib/auth';

interface Registro {
  id: number;
  accion: string;
  entidad: string;
  entidadId: number;
  datosAntes: unknown;
  datosDespues: unknown;
  ip: string | null;
  creadoEn: string;
  usuario: { id: number; nombre: string; email: string } | null;
}

// Entidades sobre las que hoy se escribe auditoría.
const ENTIDADES = ['vehiculo', 'usuario', 'marca', 'modelo', 'reporte'];

function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resumen(dato: unknown): string {
  if (dato === null || dato === undefined) return '—';
  return Object.entries(dato as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${v === null ? '∅' : v}`)
    .join(', ');
}

export default function AdminAuditoriaPage() {
  const t = useT();
  const { fetchAuth } = useAuth();
  const [filas, setFilas] = useState<Registro[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async (desde: number | null, reset: boolean) => {
      setCargando(true);
      const params = new URLSearchParams();
      if (entidad) params.set('entidad', entidad);
      if (accion.trim()) params.set('accion', accion.trim());
      if (desde) params.set('cursor', String(desde));
      const res = await fetchAuth(`/admin/auditoria?${params.toString()}`);
      if (!res.ok) {
        setError(t('admin.auditoria.loadError'));
        setCargando(false);
        return;
      }
      const data = await res.json();
      setFilas((prev) => (reset ? data.resultados : [...prev, ...data.resultados]));
      setCursor(data.siguienteCursor);
      setError('');
      setCargando(false);
    },
    [entidad, accion, fetchAuth, t],
  );

  // Recarga al montar y al cambiar la entidad; la acción se aplica al enviar.
  // biome-ignore lint/correctness/useExhaustiveDependencies: cargar cierra sobre accion, que NO debe recargar en cada tecla
  useEffect(() => {
    void cargar(null, true);
  }, [entidad]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {t('admin.auditoria.title')}
      </h1>
      <p className="mt-1 text-sm text-musgo">{t('admin.auditoria.subtitle')}</p>

      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void cargar(null, true);
        }}
      >
        <select
          value={entidad}
          onChange={(e) => setEntidad(e.target.value)}
          aria-label={t('admin.auditoria.filterEntityAria')}
          className="rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
        >
          <option value="">{t('admin.auditoria.allEntities')}</option>
          {ENTIDADES.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <input
          value={accion}
          onChange={(e) => setAccion(e.target.value)}
          placeholder={t('admin.auditoria.actionPlaceholder')}
          className="min-w-56 flex-1 rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-acento px-4 py-1.5 text-sm font-medium text-white hover:bg-acento-oscuro"
        >
          {t('admin.auditoria.filter')}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-borde bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-borde text-left text-xs uppercase tracking-wide text-musgo">
            <tr>
              <th className="px-3 py-2 font-semibold">{t('admin.auditoria.colWhen')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.auditoria.colAuthor')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.auditoria.colAction')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.auditoria.colEntity')}</th>
              <th className="px-3 py-2 font-semibold">{t('admin.auditoria.colChange')}</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((r) => (
              <tr key={r.id} className="border-b border-borde align-top last:border-0">
                <td className="cifra whitespace-nowrap px-3 py-2 text-musgo">
                  {fechaHora(r.creadoEn)}
                  {r.ip && <span className="block text-[10px]">{r.ip}</span>}
                </td>
                <td className="px-3 py-2">
                  {r.usuario ? (
                    <span title={r.usuario.email}>{r.usuario.nombre}</span>
                  ) : (
                    <span className="text-musgo">{t('admin.auditoria.system')}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="rounded bg-crema px-1.5 py-0.5 text-xs font-medium">
                    {r.accion}
                  </span>
                </td>
                <td className="cifra whitespace-nowrap px-3 py-2 text-musgo">
                  {r.entidad} #{r.entidadId}
                </td>
                <td className="px-3 py-2 text-xs text-musgo">
                  {r.datosAntes != null && (
                    <span className="line-through">{resumen(r.datosAntes)}</span>
                  )}
                  {r.datosAntes != null && r.datosDespues != null && ' → '}
                  {r.datosDespues != null && (
                    <span className="text-tinta">{resumen(r.datosDespues)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!cargando && filas.length === 0 && (
          <p className="p-8 text-center text-sm text-musgo">{t('admin.auditoria.empty')}</p>
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
            {cargando ? t('common.loading') : t('admin.auditoria.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
