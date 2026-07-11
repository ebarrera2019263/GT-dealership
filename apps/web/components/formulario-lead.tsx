'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type Estado = 'inicial' | 'enviando' | 'enviado' | 'error';

export function FormularioLead({ vehiculoId }: { vehiculoId: number }) {
  const [estado, setEstado] = useState<Estado>('inicial');
  const [mensajeError, setMensajeError] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEstado('enviando');
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiculoId,
          nombre: form.get('nombre'),
          telefono: form.get('telefono') || undefined,
          email: form.get('email') || undefined,
          canal: 'formulario',
        }),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(cuerpo?.errores?.[0]?.detalle ?? 'No se pudo enviar el mensaje');
      }
      setEstado('enviado');
    } catch (err) {
      setMensajeError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje');
      setEstado('error');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="rounded-md border border-quetzal bg-white p-4 text-sm">
        <p className="font-medium text-quetzal">Mensaje enviado</p>
        <p className="mt-1 text-musgo">El vendedor recibió tus datos y te va a contactar.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-musgo">Tu nombre</span>
        <input required name="nombre" minLength={2} maxLength={120} className={estiloControl} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-musgo">Teléfono</span>
        <input
          name="telefono"
          type="tel"
          pattern="\+?\d{8,15}"
          placeholder="50212345678"
          className={estiloControl}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-musgo">
          Email (si no dejás teléfono)
        </span>
        <input name="email" type="email" className={estiloControl} />
      </label>
      {estado === 'error' && <p className="text-sm text-red-700">{mensajeError}</p>}
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="rounded-md bg-quetzal px-4 py-2 font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Contactar al vendedor'}
      </button>
      <p className="text-xs text-musgo">
        Dejá al menos un teléfono o un email para que te respondan.
      </p>
    </form>
  );
}

const estiloControl =
  'w-full rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none';
