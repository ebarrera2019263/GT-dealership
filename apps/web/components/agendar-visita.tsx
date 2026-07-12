'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../lib/auth';

export function AgendarVisita({
  vehiculoId,
  vendedorId,
  slug,
}: {
  vehiculoId: number;
  vendedorId: number;
  slug: string;
}) {
  const { usuario, cargando, fetchAuth } = useAuth();
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok'>('idle');
  const [error, setError] = useState('');

  if (cargando) {
    return <div className="h-10" />;
  }

  // Sin sesión: agendar una visita requiere cuenta.
  if (!usuario) {
    return (
      <Link
        href={`/entrar?destino=/autos/${slug}`}
        className="mt-4 block w-full rounded-md border border-quetzal px-4 py-2 text-center text-sm font-medium text-quetzal hover:bg-crema"
      >
        Entrar para agendar una visita
      </Link>
    );
  }

  // El dueño no agenda una visita a su propio anuncio.
  if (usuario.id === vendedorId) {
    return null;
  }

  if (estado === 'ok') {
    return (
      <p className="mt-4 rounded-md border border-borde bg-crema px-3 py-2 text-center text-xs text-musgo">
        Visita solicitada. El vendedor la confirmará pronto.{' '}
        <Link href="/citas" className="font-medium text-quetzal hover:underline">
          Ver mis visitas
        </Link>
      </p>
    );
  }

  async function agendar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const valor = String(form.get('fecha') ?? '');
    if (!valor) return;
    setEstado('enviando');
    setError('');
    // datetime-local es hora local; lo mandamos como ISO (UTC) para el server.
    const res = await fetchAuth('/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiculoId, fecha: new Date(valor).toISOString() }),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? 'No se pudo agendar la visita');
      setEstado('idle');
      return;
    }
    setEstado('ok');
  }

  return (
    <form onSubmit={agendar} className="mt-4 border-t border-borde pt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-musgo">
        Agendar una visita
      </p>
      <input
        type="datetime-local"
        name="fecha"
        required
        className="w-full rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none"
      />
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="mt-2 w-full rounded-md bg-quetzal px-4 py-2 text-sm font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Solicitando…' : 'Solicitar visita'}
      </button>
    </form>
  );
}
