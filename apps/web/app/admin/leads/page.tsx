'use client';

import { useCallback, useEffect, useState } from 'react';
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
        setError('No se pudieron cargar los leads');
        setCargando(false);
        return;
      }
      const data = await res.json();
      setFilas((prev) => (reset ? data.resultados : [...prev, ...data.resultados]));
      setCursor(data.siguienteCursor);
      setError('');
      setCargando(false);
    },
    [fetchAuth],
  );

  useEffect(() => {
    void cargar(null, true);
  }, [cargar]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-musgo">Contactos recibidos por anuncio.</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-borde bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-borde text-left text-xs uppercase tracking-wide text-musgo">
            <tr>
              <th className="px-3 py-2 font-semibold">Fecha</th>
              <th className="px-3 py-2 font-semibold">Interesado</th>
              <th className="px-3 py-2 font-semibold">Contacto</th>
              <th className="px-3 py-2 font-semibold">Canal</th>
              <th className="px-3 py-2 font-semibold">Anuncio</th>
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
                  <a href={`/autos/${l.vehiculo.slug}`} className="hover:text-quetzal">
                    {l.vehiculo.marca.nombre} {l.vehiculo.modelo.nombre} {l.vehiculo.anio}
                  </a>
                  <span className="block text-xs text-musgo">
                    vendedor: {l.vehiculo.usuario.nombre}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!cargando && filas.length === 0 && (
          <p className="p-8 text-center text-sm text-musgo">Todavía no hay leads.</p>
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
