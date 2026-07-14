import type { Metadata } from 'next';
import Link from 'next/link';
import { Filtros } from '@/components/filtros';
import { GuardarBusqueda } from '@/components/guardar-busqueda';
import { VehiculoCard } from '@/components/vehiculo-card';
import { listarVehiculos, obtenerCarrocerias, obtenerMarcas } from '@/lib/api';
import { getI18n } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t('autos.metaTitle'),
    description: t('autos.metaDescription'),
  };
}

const FILTROS_VALIDOS = [
  'marca',
  'modelo',
  'carroceria',
  'precioMax',
  'precioMin',
  'anioMin',
  'anioMax',
  'kmMax',
  'orden',
  'cursor',
] as const;

export default async function ListadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { t } = await getI18n();
  const sp = await searchParams;
  const params = new URLSearchParams();
  const valores: Record<string, string | undefined> = {};
  for (const clave of FILTROS_VALIDOS) {
    const valor = sp[clave];
    if (typeof valor === 'string' && valor !== '') {
      params.set(clave, valor);
      valores[clave] = valor;
    }
  }

  const [{ resultados, siguienteCursor }, marcas, carrocerias] = await Promise.all([
    listarVehiculos(params),
    obtenerMarcas(),
    obtenerCarrocerias(),
  ]);

  const paramsSiguiente = new URLSearchParams(params);
  if (siguienteCursor) {
    paramsSiguiente.set('cursor', String(siguienteCursor));
  }

  const cantidad = resultados.length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-2xl">
        <h1 className="titular text-[length:var(--text-display)] text-tinta">{t('autos.title')}</h1>
        <p className="mt-2 text-musgo">{t('autos.subtitle')}</p>
      </header>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        {/* En móvil los filtros se pliegan; en desktop son sidebar pegajosa */}
        <aside className="md:w-64 md:shrink-0">
          <details
            className="rounded-2xl border border-borde bg-superficie p-4 md:sticky md:top-24 md:open:pb-4"
            open
          >
            <summary className="cursor-pointer font-display text-base font-semibold text-tinta md:pointer-events-none md:list-none">
              {t('autos.filters')}
            </summary>
            <div className="mt-4">
              <Filtros marcas={marcas} carrocerias={carrocerias} valores={valores} />
              <GuardarBusqueda />
            </div>
          </details>
        </aside>

        <section className="min-w-0 flex-1">
          {cantidad === 0 ? (
            <div className="rounded-2xl border border-borde bg-superficie p-12 text-center">
              <p className="font-display text-lg font-semibold text-tinta">
                {t('autos.emptyTitle')}
              </p>
              <p className="mt-2 text-sm text-musgo">
                {(() => {
                  const [antes, despues] = t('autos.emptyHint').split('{link}');
                  return (
                    <>
                      {antes}
                      <Link href="/autos" className="font-medium text-acento hover:underline">
                        {t('autos.emptyLink')}
                      </Link>
                      {despues}
                    </>
                  );
                })()}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-musgo">
                <span className="cifra font-semibold text-tinta">{cantidad}</span>
                {siguienteCursor ? '+ ' : ' '}
                {cantidad === 1 ? t('autos.countOne') : t('autos.countMany')}
              </p>
              <div className="rejilla-autos grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {resultados.map((v, i) => (
                  <div
                    key={v.id}
                    className="tarjeta-elevada"
                    style={{ animationDelay: `${Math.min(i, 11) * 55}ms` }}
                  >
                    <VehiculoCard vehiculo={v} prioridad={i < 3} />
                  </div>
                ))}
              </div>
              {siguienteCursor && (
                <div className="mt-12 text-center">
                  <Link
                    href={`/autos?${paramsSiguiente.toString()}`}
                    className="inline-block rounded-full border border-tinta/20 px-6 py-2.5 font-medium text-tinta transition-colors hover:border-acento hover:text-acento"
                  >
                    {t('autos.loadMore')}
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
