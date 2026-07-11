'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormularioVehiculo, type PayloadVehiculo } from '../../../components/formulario-vehiculo';
import { type Imagen, UploaderFotos } from '../../../components/uploader-fotos';
import { useAuth } from '../../../lib/auth';

export default function PublicarPage() {
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
      setError(cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? 'No se pudo crear el anuncio');
      return;
    }
    setVehiculoId(cuerpo.id);
  }

  async function enviarARevision() {
    if (!vehiculoId) return;
    if (imagenes.length === 0) {
      setError('Agregá al menos una foto antes de enviar a revisión.');
      return;
    }
    setEnviando(true);
    setError('');
    const res = await fetchAuth(`/mi/vehiculos/${vehiculoId}/publicar`, { method: 'POST' });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? 'No se pudo enviar a revisión');
      setEnviando(false);
      return;
    }
    router.push('/panel');
  }

  if (cargando || !usuario) {
    return <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  // ── Paso 2: fotos ──
  if (vehiculoId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-wide text-quetzal">Paso 2 de 2</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Agregá las fotos</h1>
        <p className="mt-1 text-sm text-musgo">
          Un buen set de fotos vende más rápido. Cuando termines, enviá el anuncio a revisión.
        </p>
        <div className="mt-8">
          <UploaderFotos vehiculoId={vehiculoId} inicial={imagenes} onCambio={setImagenes} />
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={enviarARevision}
            disabled={enviando}
            className="rounded-md bg-quetzal px-4 py-2 font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
          >
            {enviando ? 'Enviando…' : 'Enviar a revisión'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/panel')}
            className="text-sm text-musgo hover:text-quetzal"
          >
            Guardar como borrador
          </button>
        </div>
      </main>
    );
  }

  // ── Paso 1: datos ──
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-quetzal">Paso 1 de 2</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Publicar vehículo</h1>
      <p className="mt-1 text-sm text-musgo">
        Completá los datos. Después vas a poder subir las fotos.
      </p>
      <FormularioVehiculo
        textoSubmit="Continuar a las fotos"
        enviando={enviando}
        error={error}
        onSubmit={crear}
      />
    </main>
  );
}
