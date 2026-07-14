import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AgendarVisita } from '@/components/agendar-visita';
import { BotonFavorito } from '@/components/boton-favorito';
import { BotonReporte } from '@/components/boton-reporte';
import { ContactarVendedor } from '@/components/contactar-vendedor';
import { FormularioLead } from '@/components/formulario-lead';
import { GaleriaFicha } from '@/components/galeria-ficha';
import { PlacaPrecio } from '@/components/placa-precio';
import { SimuladorFinanciamiento } from '@/components/simulador-financiamiento';
import { VehiculoCard } from '@/components/vehiculo-card';
import { obtenerFicha, obtenerSimilares } from '@/lib/api';
import { formatearKm, traccionLegible } from '@/lib/formato';
import { getI18n } from '@/lib/i18n/server';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await obtenerFicha(slug);
  const { t } = await getI18n();
  if (!v) return { title: t('ficha.notFound') };
  return {
    title: `${v.marca.nombre} ${v.modelo.nombre} ${v.anio}${v.version ? ` ${v.version}` : ''}`,
    description: `${v.marca.nombre} ${v.modelo.nombre} ${v.anio} usado en ${v.departamento.nombre} — ${formatearKm(v.kilometraje)}, ${v.transmision.nombre}, ${v.combustible.nombre}.`,
  };
}

export default async function FichaPage({ params }: Props) {
  const { slug } = await params;
  const { t } = await getI18n();
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
    [t('ficha.specYear'), String(vehiculo.anio)],
    [t('ficha.specMileage'), formatearKm(vehiculo.kilometraje)],
    [t('ficha.specTransmission'), vehiculo.transmision.nombre],
    [t('ficha.specFuel'), vehiculo.combustible.nombre],
    [t('ficha.specBody'), vehiculo.carroceria.nombre],
    [t('ficha.specDrivetrain'), traccionLegible(vehiculo.traccion)],
    [t('ficha.specDoors'), vehiculo.puertas ? String(vehiculo.puertas) : null],
    [t('ficha.specColor'), vehiculo.color],
    [t('ficha.specOwners'), vehiculo.numDuenos ? String(vehiculo.numDuenos) : null],
    [t('ficha.specLocation'), `${vehiculo.municipio.nombre}, ${vehiculo.departamento.nombre}`],
  ];

  const tituloVehiculo = `${vehiculo.marca.nombre} ${vehiculo.modelo.nombre} ${vehiculo.anio}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requerido para SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-musgo">
        <Link href="/autos" className="hover:text-acento">
          {t('ficha.back')}
        </Link>
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_21rem]">
        <div className="min-w-0">
          {/* Galería foto-protagonista: imagen grande + miniaturas + lightbox */}
          <GaleriaFicha
            imagenes={vehiculo.imagenes}
            titulo={tituloVehiculo}
            verificado={vehiculo.verificado}
          />

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

          <h2 className="mt-10 font-display text-lg font-semibold text-tinta">
            {t('ficha.specs')}
          </h2>
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
              <h2 className="mt-10 font-display text-lg font-semibold text-tinta">
                {t('ficha.description')}
              </h2>
              <p className="prosa mt-3 whitespace-pre-line leading-relaxed text-tinta/90">
                {vehiculo.descripcion}
              </p>
            </>
          )}

          {vehiculo.caracteristicas.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-lg font-semibold text-tinta">
                {t('ficha.equipment')}
              </h2>
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
            <p className="text-sm text-musgo">{t('ficha.soldBy')}</p>
            <p className="font-display text-lg font-semibold text-tinta">
              {vehiculo.usuario.nombre}
            </p>
            {vehiculo.usuario.telefonoVerificado && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-acento">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-acento" />{' '}
                {t('ficha.phoneVerified')}
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
                {t('ficha.leaveDataNoAccount')}
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
          <h2 className="titular text-[length:var(--text-display)] text-tinta">
            {t('ficha.similar')}
          </h2>
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
