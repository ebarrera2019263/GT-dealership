'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Espeja MOTIVOS_REPORTE del backend; la etiqueta se traduce con `reporte.<valor>`.
const MOTIVOS = ['fraude', 'duplicado', 'datos_falsos', 'ya_vendido', 'inapropiado', 'otro'];

type Estado = 'inicial' | 'abierto' | 'enviando' | 'enviado' | 'error';

export function BotonReporte({ vehiculoId }: { vehiculoId: number }) {
  const t = useT();
  const [estado, setEstado] = useState<Estado>('inicial');
  const [motivo, setMotivo] = useState('fraude');
  const [detalle, setDetalle] = useState('');
  const [error, setError] = useState('');

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado('enviando');
    setError('');
    try {
      const res = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehiculoId, motivo, detalle: detalle.trim() || undefined }),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? t('reporte.sendError'));
      }
      setEstado('enviado');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reporte.sendError'));
      setEstado('error');
    }
  }

  if (estado === 'enviado') {
    return <p className="mt-4 text-center text-xs text-musgo">{t('reporte.thanks')}</p>;
  }

  if (estado === 'inicial') {
    return (
      <button
        type="button"
        onClick={() => setEstado('abierto')}
        className="mt-4 block w-full text-center text-xs text-musgo underline hover:text-red-700"
      >
        {t('reporte.reportListing')}
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-4 flex flex-col gap-2 rounded-md border border-borde p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-musgo">{t('reporte.title')}</p>
      <select
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        aria-label={t('reporte.reasonAria')}
        className="w-full rounded-md border border-borde bg-papel placeholder:text-musgo px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
      >
        {MOTIVOS.map((m) => (
          <option key={m} value={m}>
            {t(`reporte.${m}`)}
          </option>
        ))}
      </select>
      <textarea
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder={t('reporte.detailPlaceholder')}
        className="w-full rounded-md border border-borde bg-papel placeholder:text-musgo px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
      />
      {estado === 'error' && <p className="text-xs text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
        >
          {estado === 'enviando' ? t('reporte.sending') : t('reporte.send')}
        </button>
        <button
          type="button"
          onClick={() => setEstado('inicial')}
          className="rounded-md border border-borde px-3 py-1.5 text-sm hover:border-acento hover:text-acento"
        >
          {t('reporte.cancel')}
        </button>
      </div>
    </form>
  );
}
