import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactarVendedor } from '@/components/contactar-vendedor';
import { FormularioLead } from '@/components/formulario-lead';
import { PlacaPrecio } from '@/components/placa-precio';
import { VehiculoCard } from '@/components/vehiculo-card';
import { obtenerFicha, obtenerSimilares } from '@/lib/api';
import { formatearKm, traccionLegible } from '@/lib/formato';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await obtenerFicha(slug);
  if (!v) return { title: 'Anuncio no encontrado' };
  return {
    title: `${v.marca.nombre} ${v.modelo.nombre} ${v.anio}${v.version ? ` ${v.version}` : ''}`,
    description: `${v.marca.nombre} ${v.modelo.nombre} ${v.anio} usado en ${v.departamento.nombre} — ${formatearKm(v.kilometraje)}, ${v.transmision.nombre}, ${v.combustible.nombre}.`,
  };
}

export default async function FichaPage({ params }: Props) {
  const { slug } = await params;
  const vehiculo = await obtenerFicha(slug);
  if (!vehiculo) notFound();
  const similares = await obtenerSimilares(vehiculo.id);

  // SEO: datos estructurados schema.org/Vehicle (esquema §8)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${vehiculo.marca.nombre} ${vehiculo.modelo.nombre} ${vehiculo.anio}`,
    brand: { '@type': 'Brand', name: vehiculo.marca.nombre },
    model: vehiculo.modelo.nombre,
    vehicleModelDate: String(vehiculo.anio),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehiculo.kilometraje,
      unitCode: 'KMT',
    },
    fuelType: vehiculo.combustible.nombre,
    vehicleTransmission: vehiculo.transmision.nombre,
    offers: {
      '@type': 'Offer',
      price: Number(vehiculo.precio),
      priceCurrency: vehiculo.moneda,
      availability: 'https://schema.org/InStock',
    },
  };

  const especificaciones: [string, string | null][] = [
    ['Año', String(vehiculo.anio)],
    ['Kilometraje', formatearKm(vehiculo.kilometraje)],
    ['Transmisión', vehiculo.transmision.nombre],
    ['Combustible', vehiculo.combustible.nombre],
    ['Carrocería', vehiculo.carroceria.nombre],
    ['Tracción', traccionLegible(vehiculo.traccion)],
    ['Puertas', vehiculo.puertas ? String(vehiculo.puertas) : null],
    ['Color', vehiculo.color],
    ['Dueños anteriores', vehiculo.numDuenos ? String(vehiculo.numDuenos) : null],
    ['Ubicación', `${vehiculo.municipio.nombre}, ${vehiculo.departamento.nombre}`],
  ];

  const fotoPrincipal =
    vehiculo.imagenes.find((i) => i.esPrincipal) ?? vehiculo.imagenes[0] ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requerido para SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-musgo">
        <Link href="/autos" className="hover:text-quetzal">
          ← Volver al listado
        </Link>
      </nav>

      <div className="mt-4 flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-borde">
            {fotoPrincipal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPrincipal.url}
                alt={`${vehiculo.marca.nombre} ${vehiculo.modelo.nombre}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-2xl uppercase tracking-widest text-musgo">
                Sin fotos todavía
              </div>
            )}
            {vehiculo.verificado && (
              <span className="absolute left-3 top-3 rounded bg-quetzal px-2 py-0.5 text-xs font-semibold text-white">
                Verificado
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight">
            {vehiculo.marca.nombre} {vehiculo.modelo.nombre} {vehiculo.anio}
            {vehiculo.version && <span className="text-musgo"> {vehiculo.version}</span>}
          </h1>
          <div className="mt-2">
            <PlacaPrecio
              precio={vehiculo.precio}
              moneda={vehiculo.moneda}
              negociable={vehiculo.precioNegociable}
              grande
            />
          </div>

          <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-musgo">
            Especificaciones
          </h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 overflow-hidden rounded-lg border border-borde bg-white sm:grid-cols-3">
            {especificaciones
              .filter(([, valor]) => valor !== null)
              .map(([nombre, valor]) => (
                <div key={nombre} className="border-b border-borde px-4 py-3">
                  <dt className="text-xs text-musgo">{nombre}</dt>
                  <dd className="cifra text-sm font-medium">{valor}</dd>
                </div>
              ))}
          </dl>

          {vehiculo.descripcion && (
            <>
              <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-musgo">
                Descripción
              </h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{vehiculo.descripcion}</p>
            </>
          )}

          {vehiculo.caracteristicas.length > 0 && (
            <>
              <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-musgo">
                Equipamiento
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {vehiculo.caracteristicas.map(({ caracteristica }) => (
                  <li
                    key={caracteristica.id}
                    className="rounded-full border border-borde bg-white px-3 py-1 text-sm"
                  >
                    {caracteristica.nombre}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="lg:w-80 lg:shrink-0">
          <div className="rounded-lg border border-borde bg-white p-4 lg:sticky lg:top-4">
            <p className="text-sm text-musgo">Vendido por</p>
            <p className="font-medium">{vehiculo.usuario.nombre}</p>
            {vehiculo.usuario.telefonoVerificado && (
              <p className="mt-0.5 text-xs text-quetzal">Teléfono verificado</p>
            )}
            <div className="mt-4 border-t border-borde pt-4">
              <ContactarVendedor
                vehiculoId={vehiculo.id}
                vendedorId={vehiculo.usuario.id}
                slug={slug}
              />
            </div>
            <div className="mt-4 border-t border-borde pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-musgo">
                O dejá tus datos sin cuenta
              </p>
              <FormularioLead vehiculoId={vehiculo.id} />
            </div>
          </div>
        </aside>
      </div>

      {similares.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Similares a este</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similares.map((v) => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
