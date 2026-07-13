import { Check } from 'lucide-react';
import Link from 'next/link';
import type { VehiculoResumen } from '@/lib/api';
import { formatearKm } from '@/lib/formato';
import { BotonFavorito } from './boton-favorito';
import { PlacaPrecio } from './placa-precio';

export function VehiculoCard({ vehiculo }: { vehiculo: VehiculoResumen }) {
  const foto = vehiculo.imagenes[0];
  return (
    <Link
      href={`/autos/${vehiculo.slug}`}
      className="group relative flex flex-col rounded-xl outline-none transition-transform duration-200 ease-[var(--ease-salida)] focus-visible:ring-2 focus-visible:ring-quetzal focus-visible:ring-offset-2 focus-visible:ring-offset-papel active:scale-[0.99]"
    >
      {/* Foto: protagonista. Zoom sutil al hover, contenida por el radio. */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-lienzo ring-1 ring-borde/70 transition-[box-shadow,transform] duration-300 ease-[var(--ease-salida)] group-hover:-translate-y-1 group-hover:shadow-[var(--sombra-carta)]">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto.urlThumb ?? foto.url}
            alt={`${vehiculo.marca.nombre} ${vehiculo.modelo.nombre} ${vehiculo.anio}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-salida)] group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-lg font-semibold uppercase tracking-[0.2em] text-musgo/70">
            {vehiculo.carroceria.nombre}
          </div>
        )}

        {/* Etiquetas discretas, esquina superior izquierda */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {vehiculo.destacado && (
            <span className="rounded-full bg-ambar px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-tinta shadow-sm">
              Destacado
            </span>
          )}
          {vehiculo.verificado && (
            <span className="flex items-center gap-1 rounded-full bg-tinta/85 px-2.5 py-1 text-[11px] font-medium text-papel backdrop-blur-sm">
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              Verificado
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <BotonFavorito vehiculoId={vehiculo.id} slug={vehiculo.slug} />
        </div>
      </div>

      {/* Texto: título tranquilo, precio protagónico, meta callada */}
      <div className="flex flex-1 flex-col px-1 pt-3">
        <h3 className="font-display text-lg font-semibold leading-tight tracking-[-0.01em] text-tinta">
          {vehiculo.marca.nombre} {vehiculo.modelo.nombre}{' '}
          <span className="cifra font-normal text-musgo">{vehiculo.anio}</span>
          {vehiculo.version && (
            <span className="font-normal text-musgo"> · {vehiculo.version}</span>
          )}
        </h3>

        <div className="mt-1.5">
          <PlacaPrecio precio={vehiculo.precio} moneda={vehiculo.moneda} />
        </div>

        <p className="cifra mt-2 text-sm text-musgo">
          {formatearKm(vehiculo.kilometraje)} · {vehiculo.transmision.nombre} ·{' '}
          {vehiculo.departamento.nombre}
        </p>
      </div>
    </Link>
  );
}
