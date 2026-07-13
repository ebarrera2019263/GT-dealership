'use client';

import { Check, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Imagen = { id: number; url: string; urlThumb: string | null; esPrincipal: boolean };

const SWIPE_MIN = 44; // px para contar como gesto de navegación

/**
 * Galería foto-protagonista de la ficha: imagen grande + miniaturas clicables
 * y lightbox a pantalla completa (teclado ← → Esc, swipe en móvil). En un
 * clasificado la foto ES el diseño; acá se puede mirar de verdad.
 */
export function GaleriaFicha({
  imagenes,
  titulo,
  verificado,
}: {
  imagenes: Imagen[];
  titulo: string;
  verificado: boolean;
}) {
  const principalIdx = Math.max(
    0,
    imagenes.findIndex((i) => i.esPrincipal),
  );
  const [activa, setActiva] = useState(principalIdx);
  const [lightbox, setLightbox] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = imagenes.length;

  const ir = useCallback((delta: number) => setActiva((i) => (i + delta + total) % total), [total]);

  // Abrir/cerrar el <dialog> nativo en sync con el estado (top-layer, focus-trap gratis)
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (lightbox && !dlg.open) dlg.showModal();
    if (!lightbox && dlg.open) dlg.close();
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') ir(1);
      else if (e.key === 'ArrowLeft') ir(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, ir]);

  const tactil = useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    tactil.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - tactil.current;
    if (Math.abs(dx) > SWIPE_MIN) ir(dx < 0 ? 1 : -1);
  }

  if (total === 0) {
    return (
      <div className="flex aspect-[3/2] items-center justify-center rounded-2xl bg-lienzo ring-1 ring-borde font-display text-2xl font-semibold uppercase tracking-[0.2em] text-musgo/70">
        Sin fotos todavía
      </div>
    );
  }

  const img = imagenes[activa];
  const otras = total > 1;

  return (
    <div>
      {/* Imagen grande: click → lightbox. Cursor de zoom y pista al hover. */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block aspect-[3/2] w-full overflow-hidden rounded-2xl bg-lienzo ring-1 ring-borde outline-none focus-visible:ring-2 focus-visible:ring-quetzal focus-visible:ring-offset-2 focus-visible:ring-offset-papel"
        aria-label="Ampliar foto"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={img.id}
          src={img.url}
          alt={`${titulo} — foto ${activa + 1} de ${total}`}
          className="galeria-fade h-full w-full object-cover"
        />
        {verificado && (
          <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1 rounded-full bg-tinta/85 px-3 py-1 text-xs font-medium text-papel backdrop-blur-sm">
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
            Verificado
          </span>
        )}
        {/* Pista de ampliar: aparece al hover, discreta */}
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-tinta/80 px-3 py-1.5 text-xs font-medium text-papel opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <Expand className="size-3.5" strokeWidth={2} aria-hidden="true" />
          {total > 1 ? `${total} fotos` : 'Ampliar'}
        </span>
      </button>

      {/* Miniaturas clicables: la activa lleva anillo quetzal */}
      {otras && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {imagenes.map((im, i) => (
            <button
              key={im.id}
              type="button"
              onClick={() => setActiva(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === activa}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-lienzo outline-none transition duration-200 ease-[var(--ease-salida)] focus-visible:ring-2 focus-visible:ring-quetzal focus-visible:ring-offset-2 focus-visible:ring-offset-papel ${
                i === activa ? 'ring-2 ring-quetzal' : 'ring-1 ring-borde hover:ring-tinta/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={im.urlThumb ?? im.url}
                alt=""
                loading="lazy"
                className={`h-full w-full object-cover transition-opacity duration-200 ${
                  i === activa ? '' : 'opacity-80 hover:opacity-100'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox: <dialog> nativo (top-layer, Esc y focus-trap del navegador) */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: el teclado ya cierra con Esc (onCancel nativo del dialog); este click solo cierra al tocar el backdrop con el puntero */}
      <dialog
        ref={dialogRef}
        onClose={() => setLightbox(false)}
        onCancel={() => setLightbox(false)}
        onClick={(e) => {
          // Click fuera de la imagen/controles → cerrar
          if (e.target === dialogRef.current) setLightbox(false);
        }}
        className="galeria-dialog m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-papel backdrop:bg-tinta/90 backdrop:backdrop-blur-sm"
      >
        {lightbox && (
          <div
            className="flex h-[100dvh] w-full flex-col"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Barra superior: contador + cerrar */}
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <span className="cifra text-sm font-medium tabular-nums text-papel/80">
                {activa + 1} / {total}
              </span>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Cerrar"
                className="flex size-10 items-center justify-center rounded-full bg-papel/10 outline-none transition-colors duration-200 hover:bg-papel/20 focus-visible:ring-2 focus-visible:ring-papel"
              >
                <X className="size-5" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            {/* Imagen central + flechas */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={img.id}
                src={img.url}
                alt={`${titulo} — foto ${activa + 1} de ${total}`}
                className="galeria-fade max-h-full max-w-full rounded-lg object-contain"
              />
              {otras && (
                <>
                  <button
                    type="button"
                    onClick={() => ir(-1)}
                    aria-label="Foto anterior"
                    className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-papel/10 outline-none transition-colors duration-200 hover:bg-papel/20 focus-visible:ring-2 focus-visible:ring-papel sm:size-12"
                  >
                    <ChevronLeft className="size-6" strokeWidth={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => ir(1)}
                    aria-label="Foto siguiente"
                    className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-papel/10 outline-none transition-colors duration-200 hover:bg-papel/20 focus-visible:ring-2 focus-visible:ring-papel sm:size-12"
                  >
                    <ChevronRight className="size-6" strokeWidth={2} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {/* Riel de miniaturas: salto rápido dentro del lightbox */}
            {otras && (
              <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
                {imagenes.map((im, i) => (
                  <button
                    key={im.id}
                    type="button"
                    onClick={() => setActiva(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    aria-current={i === activa}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-md outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-papel ${
                      i === activa ? 'ring-2 ring-papel' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={im.urlThumb ?? im.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
