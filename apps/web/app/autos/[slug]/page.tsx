import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AgendarVisita } from '@/components/agendar-visita';
import { BotonFavorito } from '@/components/boton-favorito';
import { BotonReporte } from '@/components/boton-reporte';
import { ContactarVendedor } from '@/components/contactar-vendedor';
import { FormularioLead } from '@/components/formulario-lead';
import { PlacaPrecio } from '@/components/placa-precio';
import { SimuladorFinanciamiento } from '@/components/simulador-financiamiento';
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
    <main className="mx-auto max-w-6xl px-4 py-8">
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

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_21rem]">
        <div className="min-w-0">
          {/* Galería foto-protagonista: imagen grande + tira del resto */}
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-lienzo ring-1 ring-borde">
            {fotoPrincipal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPrincipal.url}
                alt={`${vehiculo.marca.nombre} ${vehiculo.modelo.nombre} ${vehiculo.anio}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-2xl font-semibold uppercase tracking-[0.2em] text-musgo/70">
                Sin fotos todavía
              </div>
            )}
            {vehiculo.verificado && (
              <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-tinta/85 px-3 py-1 text-xs font-medium text-papel backdrop-blur-sm">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.7 6.3a1 1 0 0 1 0 1.4l-6.5 6.5a1 1 0 0 1-1.4 0L4.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 5.8-5.8a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                Verificado
              </span>
            )}
          </div>
          {(() => {
            const otras = vehiculo.imagenes.filter((img) => img.id !== fotoPrincipal?.id);
            return otras.length > 0 ? (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {otras.slice(0, 10).map((img) => (
                  <div
                    key={img.id}
                    className="aspect-[4/3] overflow-hidden rounded-lg bg-lienzo ring-1 ring-borde"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.urlThumb ?? img.url}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          <h1 className="titular mt-8 text-[length:var(--text-titulo)] text-tinta">
            {vehiculo.marca.nombre} {vehiculo.modelo.nombre}{' '}
            <span className="cifra font-normal text-musgo">{vehiculo.anio}</span>
            {vehiculo.version && (
              <span className="font-normal text-musgo"> · {vehiculo.version}</span>
            )}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <PlacaPrecio
              precio={vehiculo.precio}
              moneda={vehiculo.moneda}
              negociable={vehiculo.precioNegociable}
              grande
            />
            <BotonFavorito vehiculoId={vehiculo.id} slug={slug} variante="boton" />
          </div>

          <h2 className="mt-10 font-display text-lg font-semibold text-tinta">Especificaciones</h2>
          <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border border-borde bg-superficie sm:grid-cols-3">
            {especificaciones
              .filter(([, valor]) => valor !== null)
              .map(([nombre, valor]) => (
                <div key={nombre} className="border-b border-borde px-4 py-3">
                  <dt className="text-xs text-musgo">{nombre}</dt>
                  <dd className="cifra mt-0.5 text-sm font-medium text-tinta">{valor}</dd>
                </div>
              ))}
          </dl>

          {vehiculo.descripcion && (
            <>
              <h2 className="mt-10 font-display text-lg font-semibold text-tinta">Descripción</h2>
              <p className="prosa mt-3 whitespace-pre-line leading-relaxed text-tinta/90">
                {vehiculo.descripcion}
              </p>
            </>
          )}

          {vehiculo.caracteristicas.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-lg font-semibold text-tinta">Equipamiento</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {vehiculo.caracteristicas.map(({ caracteristica }) => (
                  <li
                    key={caracteristica.id}
                    className="rounded-full border border-borde bg-superficie px-3 py-1.5 text-sm text-tinta"
                  >
                    {caracteristica.nombre}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-[var(--sombra-carta)]">
            <p className="text-sm text-musgo">Vendido por</p>
            <p className="font-display text-lg font-semibold text-tinta">
              {vehiculo.usuario.nombre}
            </p>
            {vehiculo.usuario.telefonoVerificado && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-quetzal">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-quetzal" /> Teléfono
                verificado
              </p>
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
            <AgendarVisita vehiculoId={vehiculo.id} vendedorId={vehiculo.usuario.id} slug={slug} />
            <BotonReporte vehiculoId={vehiculo.id} />
          </div>

          <div className="mt-4">
            <SimuladorFinanciamiento
              vehiculoId={vehiculo.id}
              precio={vehiculo.precio}
              moneda={vehiculo.moneda}
              verificado={vehiculo.verificado}
            />
          </div>
        </aside>
      </div>

      {similares.length > 0 && (
        <section className="mt-16 border-t border-borde pt-10">
          <h2 className="titular text-[length:var(--text-display)] text-tinta">Similares a este</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {similares.map((v) => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
