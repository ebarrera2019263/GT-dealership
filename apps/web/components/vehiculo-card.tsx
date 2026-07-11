import Link from 'next/link';
import type { VehiculoResumen } from '@/lib/api';
import { formatearKm } from '@/lib/formato';
import { PlacaPrecio } from './placa-precio';

export function VehiculoCard({ vehiculo }: { vehiculo: VehiculoResumen }) {
  const foto = vehiculo.imagenes[0];
  return (
    <Link
      href={`/autos/${vehiculo.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-borde bg-white transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-quetzal"
    >
      <div className="relative aspect-[4/3] bg-borde">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto.urlThumb ?? foto.url}
            alt={`${vehiculo.marca.nombre} ${vehiculo.modelo.nombre} ${vehiculo.anio}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-lg uppercase tracking-widest text-musgo">
            {vehiculo.carroceria.nombre}
          </div>
        )}
        {vehiculo.destacado && (
          <span className="absolute left-2 top-2 rounded bg-ambar px-2 py-0.5 text-xs font-semibold text-tinta">
            Destacado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-medium leading-snug">
          {vehiculo.marca.nombre} {vehiculo.modelo.nombre} {vehiculo.anio}
          {vehiculo.version && <span className="text-musgo"> · {vehiculo.version}</span>}
        </h3>
        <PlacaPrecio precio={vehiculo.precio} moneda={vehiculo.moneda} />
        <p className="cifra mt-auto text-sm text-musgo">
          {formatearKm(vehiculo.kilometraje)} · {vehiculo.transmision.nombre} ·{' '}
          {vehiculo.departamento.nombre}
        </p>
      </div>
    </Link>
  );
}
