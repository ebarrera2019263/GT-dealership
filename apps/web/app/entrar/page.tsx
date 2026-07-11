'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useAuth } from '../../lib/auth';

const estiloControl =
  'w-full rounded-md border border-borde bg-white px-3 py-2 text-sm focus:border-quetzal focus:outline-none';

function FormularioEntrar() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get('destino') ?? '/panel';
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'error'>('inicial');
  const [error, setError] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEstado('enviando');
    setError('');
    try {
      await login({
        email: String(form.get('email')),
        password: String(form.get('password')),
      });
      router.push(destino);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar');
      setEstado('error');
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-musgo">Email</span>
        <input required name="email" type="email" autoComplete="email" className={estiloControl} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-musgo">Contraseña</span>
        <input
          required
          name="password"
          type="password"
          autoComplete="current-password"
          className={estiloControl}
        />
      </label>
      {estado === 'error' && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="rounded-md bg-quetzal px-4 py-2 font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

export default function EntrarPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-musgo">Accedé para publicar y administrar tus anuncios.</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-musgo">Cargando…</p>}>
          <FormularioEntrar />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-musgo">
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="font-medium text-quetzal hover:underline">
          Registrate
        </Link>
      </p>
    </main>
  );
}
