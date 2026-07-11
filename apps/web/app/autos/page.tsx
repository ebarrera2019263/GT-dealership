import type { Metadata } from 'next';
import Link from 'next/link';
import { Filtros } from '@/components/filtros';
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold">Vehículos en venta</h1>

      <div className="mt-4 flex flex-col gap-6 md:flex-row">
        {/* En móvil los filtros se pliegan; en desktop son sidebar fija */}
        <aside className="md:w-60 md:shrink-0">
          <details className="rounded-lg border border-borde bg-white p-3 md:open:pb-3" open>
            <summary className="cursor-pointer text-sm font-medium md:pointer-events-none md:list-none">
              Filtros
            </summary>
            <div className="mt-3">
              <Filtros marcas={marcas} carrocerias={carrocerias} valores={valores} />
            </div>
          </details>
        </aside>

        <section className="flex-1">
          {resultados.length === 0 ? (
            <div className="rounded-lg border border-borde bg-white p-10 text-center">
              <p className="font-medium">No hay anuncios con esos filtros.</p>
              <p className="mt-1 text-sm text-musgo">
                Probá quitar algún filtro o{' '}
                <Link href="/autos" className="text-quetzal underline">
                  ver todos los vehículos
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resultados.map((v) => (
                  <VehiculoCard key={v.id} vehiculo={v} />
                ))}
              </div>
              {siguienteCursor && (
                <div className="mt-6 text-center">
                  <Link
                    href={`/autos?${paramsSiguiente.toString()}`}
                    className="inline-block rounded-md border border-tinta px-5 py-2 font-medium hover:bg-white"
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
