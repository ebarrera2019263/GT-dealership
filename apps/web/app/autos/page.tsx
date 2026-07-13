import type { Metadata } from 'next';
import Link from 'next/link';
import { Filtros } from '@/components/filtros';
import { GuardarBusqueda } from '@/components/guardar-busqueda';
import { VehiculoCard } from '@/components/vehiculo-card';
import { listarVehiculos, obtenerCarrocerias, obtenerMarcas } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Vehículos usados en venta',
  description:
    'Explorá vehículos usados en venta en Guatemala: filtrá por marca, precio, año y ubicación.',
};

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
        <h1 className="titular text-[length:var(--text-display)] text-tinta">Vehículos en venta</h1>
        <p className="mt-2 text-musgo">
          Explorá el mercado y filtrá por marca, precio, año y ubicación. El precio manda: todo se
          compara en quetzales.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        {/* En móvil los filtros se pliegan; en desktop son sidebar pegajosa */}
        <aside className="md:w-64 md:shrink-0">
          <details
            className="rounded-2xl border border-borde bg-superficie p-4 md:sticky md:top-24 md:open:pb-4"
            open
          >
            <summary className="cursor-pointer font-display text-base font-semibold text-tinta md:pointer-events-none md:list-none">
              Filtros
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
                No hay anuncios con esos filtros.
              </p>
              <p className="mt-2 text-sm text-musgo">
                Probá quitar algún filtro o{' '}
                <Link href="/autos" className="font-medium text-quetzal hover:underline">
                  ver todos los vehículos
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-musgo">
                <span className="cifra font-semibold text-tinta">{cantidad}</span>
                {siguienteCursor ? '+ ' : ' '}
                {cantidad === 1 ? 'vehículo' : 'vehículos'} en esta vista
              </p>
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {resultados.map((v, i) => (
                  <div
                    key={v.id}
                    className="emerge"
                    style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}
                  >
                    <VehiculoCard vehiculo={v} />
                  </div>
                ))}
              </div>
              {siguienteCursor && (
                <div className="mt-12 text-center">
                  <Link
                    href={`/autos?${paramsSiguiente.toString()}`}
                    className="inline-block rounded-full border border-tinta/20 px-6 py-2.5 font-medium text-tinta transition-colors hover:border-quetzal hover:text-quetzal"
                  >
                    Ver más resultados
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
