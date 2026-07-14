'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../lib/auth';

export function ContactarVendedor({
  vehiculoId,
  vendedorId,
  slug,
}: {
  vehiculoId: number;
  vendedorId: number;
  slug: string;
}) {
  const t = useT();
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (cargando) {
    return <div className="h-24" />;
  }

  // Sin sesión: invitamos a entrar; el mensaje interno requiere cuenta.
  if (!usuario) {
    return (
      <div className="rounded-md border border-borde bg-papel p-3 text-sm">
        <p className="text-musgo">{t('contactar.fromAccount')}</p>
        <Link
          href={`/entrar?destino=/autos/${slug}`}
          className="mt-2 inline-block rounded-md bg-acento px-3 py-1.5 font-medium text-white hover:bg-acento-oscuro"
        >
          {t('contactar.loginToWrite')}
        </Link>
      </div>
    );
  }

  // El dueño no se escribe a sí mismo.
  if (usuario.id === vendedorId) {
    return (
      <p className="rounded-md border border-borde bg-papel p-3 text-sm text-musgo">
        {t('contactar.yourListing')}
      </p>
    );
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const contenido = String(form.get('contenido') ?? '').trim();
    if (!contenido) return;
    setEnviando(true);
    setError('');
    const res = await fetchAuth('/conversaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiculoId, contenido }),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? t('contactar.sendError'));
      setEnviando(false);
      return;
    }
    const { id } = await res.json();
    router.push(`/mensajes/${id}`);
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-musgo">
          {t('contactar.label')}
        </span>
        <textarea
          name="contenido"
          required
          rows={3}
          maxLength={2000}
          placeholder={t('contactar.placeholder')}
          className="w-full rounded-md border border-borde bg-papel placeholder:text-musgo px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-acento px-4 py-2 font-medium text-white hover:bg-acento-oscuro disabled:opacity-60"
      >
        {enviando ? t('contactar.sending') : t('contactar.send')}
      </button>
    </form>
  );
}
