import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroCanvas } from '@/components/ui/hero';
import { VehiculoCard } from '@/components/vehiculo-card';
import { listarVehiculos, obtenerMarcas } from '@/lib/api';
import { getI18n } from '@/lib/i18n/server';

export default async function Home() {
  const { t } = await getI18n();
  const [{ resultados }, marcas] = await Promise.all([
    listarVehiculos(new URLSearchParams({ limite: '6' })).catch(() => ({
      resultados: [],
      siguienteCursor: null,
    })),
    obtenerMarcas().catch(() => []),
  ]);

  const franjaConfianza = [
    [t('home.trust.moderatedTitle'), t('home.trust.moderatedDesc')],
    [t('home.trust.currencyTitle'), t('home.trust.currencyDesc')],
    [t('home.trust.contactTitle'), t('home.trust.contactDesc')],
  ];

  return (
    <main>
      {/* Hero: foto del vehículo + estelas neón, con la búsqueda (acción principal) encima. */}
      <HeroCanvas
        badge={t('home.badge')}
        title1={t('home.title1')}
        title2={t('home.title2')}
        subtitle={t('home.subtitle')}
        imageAlt={t('home.imageAlt')}
      >
        <form
          method="get"
          action="/autos"
          className="flex max-w-2xl flex-col gap-2 rounded-2xl bg-superficie/95 p-2 shadow-[var(--sombra-carta)] backdrop-blur-sm sm:flex-row sm:items-center"
        >
          <select
            name="marca"
            defaultValue=""
            aria-label={t('home.brandAria')}
            className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-tinta outline-none focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-superficie"
          >
            <option value="">{t('home.allBrands')}</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.nombre}
              </option>
            ))}
          </select>
          <div className="hidden w-px self-stretch bg-borde sm:block" />
          <input
            type="number"
            name="precioMax"
            min={0}
            step={5000}
            placeholder={t('home.maxPrice')}
            aria-label={t('home.maxPriceAria')}
            className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-tinta outline-none placeholder:text-musgo focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-superficie"
          />
          <Button type="submit" className="h-auto rounded-xl px-7 py-3 text-base font-semibold">
            {t('home.search')}
          </Button>
        </form>
      </HeroCanvas>

      {/* Franja de confianza — datos, no adornos */}
      <section className="border-b border-borde bg-lienzo">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-borde sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {franjaConfianza.map(([titulo, detalle]) => (
            <div key={titulo} className="px-4 py-6 sm:px-6">
              <p className="font-display text-base font-semibold text-tinta">{titulo}</p>
              <p className="mt-1 text-sm text-musgo">{detalle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recién publicados */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="titular text-[length:var(--text-display)] text-tinta">
              {t('home.recentTitle')}
            </h2>
            <p className="mt-1 text-musgo">{t('home.recentSubtitle')}</p>
          </div>
          <Link
            href="/autos"
            className="shrink-0 rounded-full border border-tinta/15 px-4 py-2 text-sm font-medium text-tinta transition-colors hover:border-acento hover:text-acento"
          >
            {t('common.viewAll')} →
          </Link>
        </div>

        {resultados.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-borde bg-superficie p-12 text-center text-musgo">
            {t('home.empty')}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((v, i) => (
              <div
                key={v.id}
                className="emerge"
                style={{ animationDelay: `${Math.min(i, 9) * 60}ms` }}
              >
                <VehiculoCard vehiculo={v} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
