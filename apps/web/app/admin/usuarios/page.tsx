'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../../lib/auth';

interface Fila {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: 'comprador' | 'vendedor' | 'concesionario' | 'admin';
  activo: boolean;
  emailVerificado: boolean;
  telefonoVerificado: boolean;
  creadoEn: string;
  anuncios: number;
}

const ROLES = ['comprador', 'vendedor', 'concesionario', 'admin'] as const;

export default function AdminUsuariosPage() {
  const t = useT();
  const { usuario, fetchAuth } = useAuth();
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [rol, setRol] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async (desde: number | null, reset: boolean) => {
      setCargando(true);
      const params = new URLSearchParams();
      if (rol) params.set('rol', rol);
      if (busqueda.trim()) params.set('busqueda', busqueda.trim());
      if (desde) params.set('cursor', String(desde));
      const res = await fetchAuth(`/admin/usuarios?${params.toString()}`);
      if (!res.ok) {
        setError(t('admin.usuarios.loadError'));
        setCargando(false);
        return;
      }
      const data = await res.json();
      setFilas((prev) => (reset ? data.resultados : [...prev, ...data.resultados]));
      setCursor(data.siguienteCursor);
      setError('');
      setCargando(false);
    },
    [rol, busqueda, fetchAuth, t],
  );

  // Recarga al montar y al cambiar el filtro de rol; la búsqueda se dispara al enviar el form.
  // biome-ignore lint/correctness/useExhaustiveDependencies: cargar cierra sobre busqueda, que NO debe recargar en cada tecla
  useEffect(() => {
    void cargar(null, true);
  }, [rol]);

  async function cambiarRol(fila: Fila, nuevoRol: string) {
    const previo = fila.rol;
    setFilas((xs) =>
      xs.map((x) => (x.id === fila.id ? { ...x, rol: nuevoRol as Fila['rol'] } : x)),
    );
    const res = await fetchAuth(`/admin/usuarios/${fila.id}/rol`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    });
    if (!res.ok) {
      setFilas((xs) => xs.map((x) => (x.id === fila.id ? { ...x, rol: previo } : x)));
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? t('admin.usuarios.roleChangeError'));
    }
  }

  async function alternarActivo(fila: Fila) {
    const valor = !fila.activo;
    setFilas((xs) => xs.map((x) => (x.id === fila.id ? { ...x, activo: valor } : x)));
    const res = await fetchAuth(`/admin/usuarios/${fila.id}/activo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor }),
    });
    if (!res.ok) {
      setFilas((xs) => xs.map((x) => (x.id === fila.id ? { ...x, activo: !valor } : x)));
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? t('admin.usuarios.stateChangeError'));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {t('admin.usuarios.title')}
      </h1>
      <p className="mt-1 text-sm text-musgo">{t('admin.usuarios.subtitle')}</p>

      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void cargar(null, true);
        }}
      >
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          aria-label={t('admin.usuarios.filterRoleAria')}
          className="rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
        >
          <option value="">{t('admin.usuarios.allRoles')}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={t('admin.usuarios.searchPlaceholder')}
          className="min-w-56 flex-1 rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-acento px-4 py-1.5 text-sm font-medium text-white hover:bg-acento-oscuro"
        >
          {t('admin.usuarios.search')}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-borde bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-borde text-left text-xs uppercase tracking-wide text-musgo">
            <tr>
              <th className="px-3 py-2 font-semibold">{t('admin.usuarios.colUser')}</th>
              <th className="px-3 py-2 text-right font-semibold">
                {t('admin.usuarios.colListings')}
              </th>
              <th className="px-3 py-2 font-semibold">{t('admin.usuarios.colRole')}</th>
              <th className="px-3 py-2 text-center font-semibold">
                {t('admin.usuarios.colState')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((u) => {
              const esYo = usuario?.id === u.id;
              return (
                <tr key={u.id} className="border-b border-borde last:border-0">
                  <td className="px-3 py-2">
                    <p className="font-medium">
                      {u.nombre}
                      {esYo && (
                        <span className="ml-1 text-xs text-musgo">{t('admin.usuarios.you')}</span>
                      )}
                    </p>
                    <p className="text-xs text-musgo">
                      {u.email}
                      {u.emailVerificado ? ' ✓' : ''}
                    </p>
                  </td>
                  <td className="cifra px-3 py-2 text-right">{u.anuncios}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.rol}
                      disabled={esYo}
                      onChange={(e) => cambiarRol(u, e.target.value)}
                      aria-label={t('admin.usuarios.roleOfAria', { nombre: u.nombre })}
                      className="rounded-md border border-borde bg-white px-2 py-1 text-xs focus:border-acento focus:outline-none disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      disabled={esYo}
                      onClick={() => alternarActivo(u)}
                      className={`rounded-md border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                        u.activo
                          ? 'border-green-600 bg-green-50 text-green-800 hover:bg-green-100'
                          : 'border-red-600 bg-red-50 text-red-800 hover:bg-red-100'
                      }`}
                    >
                      {u.activo ? t('admin.usuarios.active') : t('admin.usuarios.suspended')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!cargando && filas.length === 0 && (
          <p className="p-8 text-center text-sm text-musgo">{t('admin.usuarios.empty')}</p>
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
            {cargando ? t('common.loading') : t('admin.usuarios.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
