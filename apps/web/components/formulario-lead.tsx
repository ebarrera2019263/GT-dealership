'use client';

import { leadCrearSchema } from '@concesionario/shared';
import { useState } from 'react';
import { CampoValidado, estiloControlValidado } from '@/components/ui/campo-validado';
import { useT } from '@/lib/i18n/provider';
import { useValidacion } from '@/lib/validacion';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type Estado = 'inicial' | 'enviando' | 'enviado' | 'error';

export function FormularioLead({ vehiculoId }: { vehiculoId: number }) {
  const t = useT();
  const [estado, setEstado] = useState<Estado>('inicial');
  const [mensajeError, setMensajeError] = useState('');

  const v = useValidacion(leadCrearSchema, (c) => ({
    vehiculoId,
    nombre: c.nombre ?? '',
    telefono: c.telefono?.trim() ? c.telefono.trim() : undefined,
    email: c.email?.trim() ? c.email.trim() : undefined,
    canal: 'formulario' as const,
  }));

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = v.validar();
    if (!datos) return;
    setEstado('enviando');
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(cuerpo?.errores?.[0]?.detalle ?? t('lead.sendError'));
      }
      setEstado('enviado');
    } catch (err) {
      setMensajeError(err instanceof Error ? err.message : t('lead.sendError'));
      setEstado('error');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="rounded-md border border-acento bg-superficie p-4 text-sm">
        <p className="font-medium text-acento">{t('lead.sentTitle')}</p>
        <p className="mt-1 text-musgo">{t('lead.sentBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
      <CampoValidado etiqueta={t('lead.name')} nombre="nombre" error={v.errorDe('nombre')}>
        <input {...v.campo('nombre')} autoComplete="name" className={estiloControlValidado} />
      </CampoValidado>
      <CampoValidado etiqueta={t('lead.phone')} nombre="telefono" error={v.errorDe('telefono')}>
        <input
          {...v.campo('telefono')}
          type="tel"
          inputMode="tel"
          placeholder="50212345678"
          className={estiloControlValidado}
        />
      </CampoValidado>
      <CampoValidado etiqueta={t('lead.emailIfNoPhone')} nombre="email" error={v.errorDe('email')}>
        <input
          {...v.campo('email')}
          type="email"
          autoComplete="email"
          className={estiloControlValidado}
        />
      </CampoValidado>
      {estado === 'error' && (
        <p role="alert" className="text-sm text-red-700">
          {mensajeError}
        </p>
      )}
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="rounded-md bg-acento px-4 py-2 font-medium text-white hover:bg-acento-oscuro disabled:opacity-60"
      >
        {estado === 'enviando' ? t('lead.sending') : t('lead.submit')}
      </button>
      <p className="text-xs text-musgo">{t('lead.hint')}</p>
    </form>
  );
}
