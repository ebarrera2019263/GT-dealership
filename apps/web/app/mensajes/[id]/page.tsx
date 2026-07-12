'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../lib/auth';

interface Mensaje {
  id: number;
  emisorId: number;
  contenido: string;
  creadoEn: string;
  mio: boolean;
}

interface Conversacion {
  id: number;
  rolPropio: 'comprador' | 'vendedor';
  vehiculo: {
    slug: string;
    anio: number;
    estado: string;
    marca: { nombre: string };
    modelo: { nombre: string };
  } | null;
  contraparte: { id: number; nombre: string };
  mensajes: Mensaje[];
}

function hora(iso: string): string {
  return new Date(iso).toLocaleString('es-GT', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ConversacionPage() {
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [conv, setConv] = useState<Conversacion | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAuth(`/conversaciones/${id}`);
    if (!res.ok) {
      setEstado('error');
      return;
    }
    setConv(await res.json());
    setEstado('listo');
  }, [fetchAuth, id]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace(`/entrar?destino=/mensajes/${id}`);
      return;
    }
    void cargar();
  }, [cargando, usuario, router, id, cargar]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll al último mensaje
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.mensajes.length]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const contenido = String(data.get('contenido') ?? '').trim();
    if (!contenido) return;
    setEnviando(true);
    const res = await fetchAuth(`/conversaciones/${id}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido }),
    });
    if (res.ok) {
      const nuevo: Mensaje = await res.json();
      setConv((c) => (c ? { ...c, mensajes: [...c.mensajes, nuevo] } : c));
      form.reset();
    }
    setEnviando(false);
  }

  if (cargando || estado === 'cargando') {
    return <main className="mx-auto max-w-2xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  if (estado === 'error' || !conv) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-musgo">No se encontró la conversación o no participás en ella.</p>
        <Link
          href="/mensajes"
          className="mt-3 inline-block font-medium text-quetzal hover:underline"
        >
          Volver a mensajes
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-4 py-6">
      <Link href="/mensajes" className="text-sm text-musgo hover:text-quetzal">
        ← Mensajes
      </Link>

      <div className="mt-3 rounded-lg border border-borde bg-white p-3">
        <p className="text-sm text-musgo">
          {conv.rolPropio === 'comprador' ? 'Vendedor' : 'Comprador'}:{' '}
          <span className="font-medium text-tinta">{conv.contraparte.nombre}</span>
        </p>
        {conv.vehiculo && (
          <Link
            href={`/autos/${conv.vehiculo.slug}`}
            className="text-sm font-medium text-quetzal hover:underline"
          >
            {conv.vehiculo.marca.nombre} {conv.vehiculo.modelo.nombre} {conv.vehiculo.anio}
          </Link>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {conv.mensajes.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.mio
                ? 'self-end bg-quetzal text-white'
                : 'self-start border border-borde bg-white text-tinta'
            }`}
          >
            <p className="whitespace-pre-line">{m.contenido}</p>
            <p className={`mt-1 text-xs ${m.mio ? 'text-white/70' : 'text-musgo'}`}>
              {hora(m.creadoEn)}
            </p>
          </div>
        ))}
        <div ref={finRef} />
      </div>

      <form onSubmit={enviar} className="sticky bottom-0 mt-4 flex gap-2 bg-papel py-2">
        <input
          name="contenido"
          required
          maxLength={2000}
          autoComplete="off"
          placeholder="Escribí un mensaje…"
          className="flex-1 rounded-md border border-borde bg-white px-3 py-2 text-sm focus:border-quetzal focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-quetzal px-4 py-2 text-sm font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </main>
  );
}
