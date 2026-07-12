'use client';

import { useCallback, useEffect, useState } from 'react';
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

const ESTADO_UI: Record<string, { texto: string; clase: string }> = {
  borrador: { texto: 'Borrador', clase: 'bg-crema text-musgo' },
  en_revision: { texto: 'En revisión', clase: 'bg-amber-100 text-amber-800' },
  publicado: { texto: 'Publicado', clase: 'bg-green-100 text-green-800' },
  rechazado: { texto: 'Rechazado', clase: 'bg-red-100 text-red-800' },
  pausado: { texto: 'Pausado', clase: 'bg-crema text-musgo' },
  expirado: { texto: 'Expirado', clase: 'bg-crema text-musgo' },
  vendido: { texto: 'Vendido', clase: 'bg-tinta text-white' },
};

export default function AdminVehiculosPage() {
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
        setError('No se pudieron cargar los anuncios');
        setCargando(false);
        return;
      }
      const data = await res.json();
      setFilas((prev) => (reset ? data.resultados : [...prev, ...data.resultados]));
      setCursor(data.siguienteCursor);
      setError('');
      setCargando(false);
    },
    [estado, fetchAuth],
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
      <h1 className="font-display text-3xl font-bold tracking-tight">Vehículos</h1>
      <p className="mt-1 text-sm text-musgo">Todos los anuncios en cualquier estado.</p>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm text-musgo" htmlFor="filtro-estado">
          Estado
        </label>
        <select
          id="filtro-estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none"
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_UI[e].texto}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-borde bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-borde text-left text-xs uppercase tracking-wide text-musgo">
            <tr>
              <th className="px-3 py-2 font-semibold">Anuncio</th>
              <th className="px-3 py-2 font-semibold">Precio</th>
              <th className="px-3 py-2 font-semibold">Estado</th>
              <th className="px-3 py-2 font-semibold">Vendedor</th>
              <th className="px-3 py-2 text-right font-semibold">Vistas · Contactos</th>
              <th className="px-3 py-2 text-center font-semibold">Verificado</th>
              <th className="px-3 py-2 text-center font-semibold">Destacado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((v) => {
              const ui = ESTADO_UI[v.estado] ?? { texto: v.estado, clase: 'bg-crema text-musgo' };
              return (
                <tr key={v.id} className="border-b border-borde last:border-0">
                  <td className="px-3 py-2">
                    <a href={`/autos/${v.slug}`} className="font-medium hover:text-quetzal">
                      {v.marca.nombre} {v.modelo.nombre} {v.anio}
                    </a>
                    {v.version && <span className="text-musgo"> · {v.version}</span>}
                  </td>
                  <td className="cifra whitespace-nowrap px-3 py-2">
                    {formatearPrecio(v.precio, v.moneda)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${ui.clase}`}
                    >
                      {ui.texto}
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
                          ? 'border-quetzal bg-quetzal text-white'
                          : 'border-borde text-musgo hover:border-quetzal hover:text-quetzal'
                      }`}
                    >
                      {v.verificado ? '✓ Sí' : 'No'}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => alternar(v, 'destacado')}
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        v.destacado
                          ? 'border-quetzal bg-quetzal text-white'
                          : 'border-borde text-musgo hover:border-quetzal hover:text-quetzal'
                      }`}
                    >
                      {v.destacado ? '★ Sí' : 'No'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!cargando && filas.length === 0 && (
          <p className="p-8 text-center text-sm text-musgo">No hay anuncios con ese filtro.</p>
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
            {cargando ? 'Cargando…' : 'Ver más'}
          </button>
        </div>
      )}
    </div>
  );
}
