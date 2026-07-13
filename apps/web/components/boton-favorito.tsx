'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/auth';
import { useFavoritos } from '../lib/favoritos';

export function BotonFavorito({
  vehiculoId,
  slug,
  variante = 'icono',
}: {
  vehiculoId: number;
  slug?: string;
  variante?: 'icono' | 'boton';
}) {
  const { usuario } = useAuth();
  const { esFavorito, alternar } = useFavoritos();
  const router = useRouter();
  const activo = esFavorito(vehiculoId);
  // Solo animamos al ACTIVAR (no al quitar): el "pop" celebra el guardado.
  const [pulso, setPulso] = useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!usuario) {
      router.push(`/entrar?destino=${slug ? `/autos/${slug}` : '/autos'}`);
      return;
    }
    if (!activo) setPulso(true);
    void alternar(vehiculoId);
  }

  const corazon = (
    <Heart
      className={cn('size-5', activo && 'fill-current', pulso && 'pop-corazon')}
      strokeWidth={2}
      aria-hidden="true"
      onAnimationEnd={() => setPulso(false)}
    />
  );

  if (variante === 'boton') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={activo}
        className={cn(
          'flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-200 active:scale-[0.97]',
          activo
            ? 'border-acento bg-acento/10 text-acento'
            : 'border-borde bg-white text-tinta hover:border-acento hover:text-acento',
        )}
      >
        {corazon}
        {activo ? 'Guardado' : 'Guardar'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      aria-pressed={activo}
      className={cn(
        'flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-[color,transform] duration-200 hover:scale-105 active:scale-90',
        activo ? 'text-acento' : 'text-musgo hover:text-acento',
      )}
    >
      {corazon}
    </button>
  );
}
