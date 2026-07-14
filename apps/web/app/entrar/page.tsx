'use client';

import { loginSchema } from '@concesionario/shared';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { CampoValidado, estiloControlValidado } from '@/components/ui/campo-validado';
import { useT } from '@/lib/i18n/provider';
import { useValidacion } from '@/lib/validacion';
import { useAuth } from '../../lib/auth';

function FormularioEntrar() {
  const t = useT();
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get('destino') ?? '/panel';
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'error'>('inicial');
  const [error, setError] = useState('');

  const v = useValidacion(loginSchema, (c) => ({
    email: c.email ?? '',
    password: c.password ?? '',
  }));

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = v.validar();
    if (!datos) return;
    setEstado('enviando');
    setError('');
    try {
      await login(datos);
      router.push(destino);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginError'));
      setEstado('error');
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <CampoValidado etiqueta={t('auth.email')} nombre="email" error={v.errorDe('email')}>
        <input
          {...v.campo('email')}
          type="email"
          autoComplete="email"
          className={estiloControlValidado}
        />
      </CampoValidado>
      <CampoValidado etiqueta={t('auth.password')} nombre="password" error={v.errorDe('password')}>
        <input
          {...v.campo('password')}
          type="password"
          autoComplete="current-password"
          className={estiloControlValidado}
        />
      </CampoValidado>
      {estado === 'error' && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="rounded-md bg-acento px-4 py-2 font-medium text-white hover:bg-acento-oscuro disabled:opacity-60"
      >
        {estado === 'enviando' ? t('auth.signingIn') : t('auth.login')}
      </button>
    </form>
  );
}

export default function EntrarPage() {
  const t = useT();
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">{t('auth.loginTitle')}</h1>
      <p className="mt-1 text-sm text-musgo">{t('auth.loginSubtitle')}</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-musgo">{t('common.loading')}</p>}>
          <FormularioEntrar />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-musgo">
        {t('auth.noAccount')}{' '}
        <Link href="/registro" className="font-medium text-acento hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </main>
  );
}
