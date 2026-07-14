'use client';

import { useRef, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../lib/auth';

const MAX = 12;

export interface Imagen {
  id: number;
  url: string;
  urlThumb: string | null;
  esPrincipal: boolean;
}

export function UploaderFotos({
  vehiculoId,
  inicial = [],
  onCambio,
}: {
  vehiculoId: number;
  inicial?: Imagen[];
  onCambio?: (imagenes: Imagen[]) => void;
}) {
  const t = useT();
  const { fetchAuth } = useAuth();
  const [imagenes, setImagenes] = useState<Imagen[]>(inicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function actualizar(nuevas: Imagen[]) {
    setImagenes(nuevas);
    onCambio?.(nuevas);
  }

  async function subir(archivos: FileList) {
    if (archivos.length === 0) return;
    if (imagenes.length + archivos.length > MAX) {
      setError(t('uploader.maxError', { max: MAX }));
      return;
    }
    setSubiendo(true);
    setError('');
    const fd = new FormData();
    for (const archivo of Array.from(archivos)) {
      fd.append('imagenes', archivo);
    }
    const res = await fetchAuth(`/mi/vehiculos/${vehiculoId}/imagenes`, {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? t('uploader.uploadError'));
    } else {
      actualizar(await res.json());
    }
    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function eliminar(imagenId: number) {
    setError('');
    const res = await fetchAuth(`/mi/vehiculos/${vehiculoId}/imagenes/${imagenId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      setError(t('uploader.deleteError'));
      return;
    }
    actualizar(await res.json());
  }

  async function hacerPrincipal(imagenId: number) {
    const orden = [imagenId, ...imagenes.filter((i) => i.id !== imagenId).map((i) => i.id)];
    const res = await fetchAuth(`/mi/vehiculos/${vehiculoId}/imagenes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orden }),
    });
    if (res.ok) actualizar(await res.json());
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {imagenes.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-md bg-papel"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.urlThumb ?? img.url}
              alt={t('uploader.photoAlt')}
              className="h-full w-full object-cover"
            />
            {img.esPrincipal && (
              <span className="absolute left-1 top-1 rounded bg-acento px-1.5 py-0.5 text-xs font-medium text-white">
                {t('uploader.principal')}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-tinta/70 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              {!img.esPrincipal && (
                <button
                  type="button"
                  onClick={() => hacerPrincipal(img.id)}
                  className="text-xs font-medium text-papel hover:text-acento"
                >
                  {t('uploader.principal')}
                </button>
              )}
              <button
                type="button"
                onClick={() => eliminar(img.id)}
                className="ml-auto text-xs font-medium text-papel hover:text-red-300"
              >
                {t('uploader.remove')}
              </button>
            </div>
          </div>
        ))}

        {imagenes.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="flex aspect-[4/3] flex-col items-center justify-center rounded-md border border-dashed border-borde text-sm text-musgo hover:border-acento hover:text-acento disabled:opacity-60"
          >
            {subiendo ? t('uploader.uploading') : t('uploader.add')}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && subir(e.target.files)}
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-musgo">{t('uploader.hint', { max: MAX })}</p>
    </div>
  );
}
