import Link from 'next/link';
import { VehiculoCard } from '@/components/vehiculo-card';
import { listarVehiculos, obtenerMarcas } from '@/lib/api';

export default async function Home() {
  const [{ resultados }, marcas] = await Promise.all([
    listarVehiculos(new URLSearchParams({ limite: '6' })).catch(() => ({
      resultados: [],
      siguienteCursor: null,
    })),
    obtenerMarcas().catch(() => []),
  ]);

  return (
    <main>
      {/* El hero es la búsqueda: en un clasificado nadie viene a leer, viene a buscar */}
      <section className="border-b border-borde bg-tinta text-papel">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
            Tu próximo carro está en Guatemala.
          </h1>
          <p className="mt-3 max-w-xl text-papel/70">
            Anuncios moderados, precios en quetzales o dólares y contacto directo con quien vende.
          </p>

          <form
            method="get"
            action="/autos"
            className="mt-8 flex max-w-2xl flex-col gap-2 sm:flex-row"
          >
            <select
              name="marca"
              defaultValue=""
              aria-label="Marca"
              className="flex-1 rounded-md border border-transparent bg-papel px-3 py-2.5 text-tinta focus:outline-2 focus:outline-quetzal"
            >
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.nombre}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="precioMax"
              min={0}
              step={5000}
              placeholder="Precio máximo (Q)"
              aria-label="Precio máximo en quetzales"
              className="flex-1 rounded-md border border-transparent bg-papel px-3 py-2.5 text-tinta placeholder:text-musgo focus:outline-2 focus:outline-quetzal"
            />
            <button
              type="submit"
              className="rounded-md bg-quetzal px-6 py-2.5 font-medium text-white hover:bg-quetzal-oscuro"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold">Publicados recientemente</h2>
          <Link href="/autos" className="text-sm text-quetzal hover:underline">
            Ver todos →
          </Link>
        </div>
        {resultados.length === 0 ? (
          <p className="mt-6 rounded-lg border border-borde bg-white p-8 text-center text-musgo">
            Todavía no hay anuncios publicados. Sé el primero en vender tu carro acá.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((v) => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
