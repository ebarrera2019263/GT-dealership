import { formatearPrecio } from '@/lib/formato';

/**
 * El elemento firma del sitio: el precio tratado como placa — borde doble,
 * numerales condensados y tabulares. En clasificados la gente escanea por
 * precio; acá el precio ES la jerarquía.
 */
export function PlacaPrecio({
  precio,
  moneda,
  negociable = false,
  grande = false,
}: {
  precio: string | number;
  moneda: 'GTQ' | 'USD';
  negociable?: boolean;
  grande?: boolean;
}) {
  return (
    <div className="inline-flex items-baseline gap-2">
      <span
        className={`cifra inline-block rounded border-2 border-tinta bg-white px-2 py-0.5 font-display font-bold leading-none ${
          grande ? 'text-3xl' : 'text-xl'
        }`}
      >
        {formatearPrecio(precio, moneda)}
      </span>
      {negociable && <span className="text-xs text-musgo">negociable</span>}
    </div>
  );
}
