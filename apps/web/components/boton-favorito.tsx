'use client';

import { useRouter } from 'next/navigation';
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

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!usuario) {
      router.push(`/entrar?destino=${slug ? `/autos/${slug}` : '/autos'}`);
      return;
    }
    void alternar(vehiculoId);
  }

  const corazon = (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={activo ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      role="img"
      aria-hidden="true"
    >
      <title>Favorito</title>
      <path d="M12 21s-7.5-4.9-10-9.5C.5 8 2 4.5 5.5 4.5c2 0 3.4 1.2 4.5 2.6 1.1-1.4 2.5-2.6 4.5-2.6C18 4.5 19.5 8 22 11.5 19.5 16.1 12 21 12 21z" />
    </svg>
  );

  if (variante === 'boton') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={activo}
        className={`flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium ${
          activo
            ? 'border-quetzal bg-quetzal/10 text-quetzal'
            : 'border-borde bg-white text-tinta hover:border-quetzal hover:text-quetzal'
        }`}
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
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur ${
        activo ? 'text-quetzal' : 'text-musgo hover:text-quetzal'
      }`}
    >
      {corazon}
    </button>
  );
}
