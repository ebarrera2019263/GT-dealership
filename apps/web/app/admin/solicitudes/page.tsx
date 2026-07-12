'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { formatearPrecio } from '../../../lib/formato';

interface Solicitud {
  id: number;
  monto: string;
  enganche: string;
  plazo: number;
  cuotaEstimada: string;
  estado: 'enviada' | 'en_revision' | 'aprobada' | 'rechazada';
  creadoEn: string;
  usuario: { id: number; nombre: string; email: string; telefono: string | null };
  vehiculo: { slug: string; anio: number; marca: { nombre: string }; modelo: { nombre: string } };
  plan: { nombre: string; entidad: { nombre: string } };
}

const ESTADOS = ['enviada', 'en_revision', 'aprobada', 'rechazada'] as const;

export default function AdminSolicitudesPage() {
  const { fetchAuth } = useAuth();
  const [filas, setFilas] = useState<Solicitud[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [estado, setEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async (desde: number | null, reset: boolean) => {
      setCargando(true);
      const params = new URLSearchParams();
      if (estado) params.set('estado', estado);
      if (desde) params.set('cursor', String(desde));
      const res = await fetchAuth(`/admin/solicitudes-credito?${params.toString()}`);
      if (!res.ok) {
        setError('No se pudieron cargar las solicitudes');
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

  useEffect(() => {
    void cargar(null, true);
  }, [cargar]);

  async function cambiarEstado(s: Solicitud, nuevo: string) {
    const previo = s.estado;
    setFilas((xs) =>
      xs.map((x) => (x.id === s.id ? { ...x, estado: nuevo as Solicitud['estado'] } : x)),
    );
    const res = await fetchAuth(`/admin/solicitudes-credito/${s.id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevo }),
    });
    if (!res.ok) {
      setFilas((xs) => xs.map((x) => (x.id === s.id ? { ...x, estado: previo } : x)));
      setError('No se pudo cambiar el estado');
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Solicitudes de crédito</h1>
      <p className="mt-1 text-sm text-musgo">
        Trámites de financiamiento enviados por compradores.
      </p>

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
              {e}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <ul className="mt-4 flex flex-col gap-3">
        {filas.map((s) => (
          <li key={s.id} className="rounded-lg border border-borde bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <a href={`/autos/${s.vehiculo.slug}`} className="font-medium hover:text-quetzal">
                  {s.vehiculo.marca.nombre} {s.vehiculo.modelo.nombre} {s.vehiculo.anio}
                </a>
                <p className="text-xs text-musgo">
                  {s.plan.entidad.nombre} · {s.plan.nombre}
                </p>
                <p className="cifra mt-1 text-sm text-musgo">
                  Cuota {formatearPrecio(s.cuotaEstimada, 'GTQ')}/mes · {s.plazo} meses · enganche{' '}
                  {formatearPrecio(s.enganche, 'GTQ')}
                </p>
                <p className="mt-1 text-xs text-musgo">
                  {s.usuario.nombre} · {s.usuario.telefono ?? s.usuario.email}
                </p>
              </div>
              <select
                value={s.estado}
                onChange={(e) => cambiarEstado(s, e.target.value)}
                aria-label={`Estado de la solicitud ${s.id}`}
                className="rounded-md border border-borde bg-white px-2 py-1 text-sm focus:border-quetzal focus:outline-none"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>

      {!cargando && filas.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          No hay solicitudes con ese filtro.
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
            {cargando ? 'Cargando…' : 'Ver más'}
          </button>
        </div>
      )}
    </div>
  );
}
