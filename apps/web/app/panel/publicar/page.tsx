'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { FormularioVehiculo, type PayloadVehiculo } from '../../../components/formulario-vehiculo';
import { type Imagen, UploaderFotos } from '../../../components/uploader-fotos';
import { useAuth } from '../../../lib/auth';

export default function PublicarPage() {
  const t = useT();
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();

  const [vehiculoId, setVehiculoId] = useState<number | null>(null);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace('/entrar?destino=/panel/publicar');
    }
  }, [cargando, usuario, router]);

  async function crear(payload: PayloadVehiculo) {
    setEnviando(true);
    setError('');
    const res = await fetchAuth('/mi/vehiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const cuerpo = await res.json().catch(() => null);
    setEnviando(false);
    if (!res.ok) {
      setError(cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? t('publicar.createError'));
      return;
    }
    setVehiculoId(cuerpo.id);
  }

  async function enviarARevision() {
    if (!vehiculoId) return;
    if (imagenes.length === 0) {
      setError(t('publicar.needPhoto'));
      return;
    }
    setEnviando(true);
    setError('');
    const res = await fetchAuth(`/mi/vehiculos/${vehiculoId}/publicar`, { method: 'POST' });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? t('publicar.reviewError'));
      setEnviando(false);
      return;
    }
    router.push('/panel');
  }

  if (cargando || !usuario) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-musgo">{t('common.loading')}</main>
    );
  }

  // ── Paso 2: fotos ──
  if (vehiculoId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-wide text-acento">
          {t('publicar.step2Label')}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {t('publicar.step2Title')}
        </h1>
        <p className="mt-1 text-sm text-musgo">{t('publicar.step2Subtitle')}</p>
        <div className="mt-8">
          <UploaderFotos vehiculoId={vehiculoId} inicial={imagenes} onCambio={setImagenes} />
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={enviarARevision}
            disabled={enviando}
            className="rounded-md bg-acento px-4 py-2 font-medium text-white hover:bg-acento-oscuro disabled:opacity-60"
          >
            {enviando ? t('publicar.sending') : t('publicar.sendToReview')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/panel')}
            className="text-sm text-musgo hover:text-acento"
          >
            {t('publicar.saveDraft')}
          </button>
        </div>
      </main>
    );
  }

  // ── Paso 1: datos ──
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-acento">
        {t('publicar.step1Label')}
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
        {t('publicar.step1Title')}
      </h1>
      <p className="mt-1 text-sm text-musgo">{t('publicar.step1Subtitle')}</p>
      <FormularioVehiculo
        textoSubmit={t('publicar.continueToPhotos')}
        enviando={enviando}
        error={error}
        onSubmit={crear}
      />
    </main>
  );
}
