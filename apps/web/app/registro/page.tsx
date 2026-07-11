'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';

const estiloControl =
  'w-full rounded-md border border-borde bg-white px-3 py-2 text-sm focus:border-quetzal focus:outline-none';

export default function RegistroPage() {
  const { registro } = useAuth();
  const router = useRouter();
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'error'>('inicial');
  const [error, setError] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEstado('enviando');
    setError('');
    try {
      const telefono = String(form.get('telefono') ?? '').trim();
      await registro({
        nombre: String(form.get('nombre')),
        email: String(form.get('email')),
        password: String(form.get('password')),
        telefono: telefono || undefined,
        rol: 'vendedor',
      });
      router.push('/panel/publicar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
      setEstado('error');
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">Crear cuenta de vendedor</h1>
      <p className="mt-1 text-sm text-musgo">
        Publicá tu vehículo gratis. Comprar no requiere cuenta.
      </p>
      <form onSubmit={enviar} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-musgo">Nombre</span>
          <input required name="nombre" minLength={2} maxLength={120} className={estiloControl} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-musgo">Email</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className={estiloControl}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-musgo">
            Teléfono (opcional)
          </span>
          <input
            name="telefono"
            type="tel"
            pattern="\+?\d{8,15}"
            placeholder="50212345678"
            className={estiloControl}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-musgo">Contraseña</span>
          <input
            required
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            className={estiloControl}
          />
          <span className="text-xs text-musgo">Mínimo 8 caracteres.</span>
        </label>
        {estado === 'error' && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="rounded-md bg-quetzal px-4 py-2 font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
        >
          {estado === 'enviando' ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="mt-6 text-sm text-musgo">
        ¿Ya tenés cuenta?{' '}
        <Link href="/entrar" className="font-medium text-quetzal hover:underline">
          Entrá
        </Link>
      </p>
    </main>
  );
}
