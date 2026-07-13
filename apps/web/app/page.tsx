import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VehiculoCard } from '@/components/vehiculo-card';
import { listarVehiculos, obtenerMarcas } from '@/lib/api';

const HERO_IMG =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80';

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
      {/* Hero foto-protagonista: en un clasificado la gente viene a buscar, y el
          auto es lo que vende. La foto manda; la búsqueda se posa encima. */}
      <section className="relative isolate flex min-h-[78vh] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMG}
          alt="Un coupé deportivo bajo luz cálida, listo para salir a la carretera"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta via-tinta/70 to-tinta/25" />

        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-28 md:pb-16">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium text-papel/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-quetzal-vivo" />
            Marketplace de vehículos usados · Guatemala
          </p>
          <h1 className="titular max-w-3xl text-[length:var(--text-hero)] text-papel">
            Tu próximo carro <span className="text-quetzal-vivo">te está esperando.</span>
          </h1>
          <p className="prosa mt-4 text-lg text-papel/85">
            Anuncios moderados, precios en quetzales o dólares y contacto directo con quien vende.
            Sin intermediarios, sin vueltas.
          </p>

          {/* Panel de búsqueda: se apoya sobre la foto, blanco y firme */}
          <form
            method="get"
            action="/autos"
            className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl bg-superficie/95 p-2 shadow-[var(--sombra-carta)] backdrop-blur-sm sm:flex-row sm:items-center"
          >
            <select
              name="marca"
              defaultValue=""
              aria-label="Marca"
              className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-tinta focus:outline-none"
            >
              <option value="">Todas las marcas</option>
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
              placeholder="Precio máximo (Q)"
              aria-label="Precio máximo en quetzales"
              className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-tinta placeholder:text-musgo focus:outline-none"
            />
            <Button type="submit" className="h-auto rounded-xl px-7 py-3 text-base font-semibold">
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Franja de confianza — datos, no adornos */}
      <section className="border-b border-borde bg-lienzo">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-borde sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ['Anuncios moderados', 'Cada publicación pasa por revisión antes de salir.'],
            ['GTQ y USD', 'Precios normalizados a quetzales para comparar de verdad.'],
            ['Contacto directo', 'Escribís o agendás una visita con quien vende.'],
          ].map(([titulo, detalle]) => (
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
              Recién publicados
            </h2>
            <p className="mt-1 text-musgo">Lo último que entró al mercado.</p>
          </div>
          <Link
            href="/autos"
            className="shrink-0 rounded-full border border-tinta/15 px-4 py-2 text-sm font-medium text-tinta transition-colors hover:border-quetzal hover:text-quetzal"
          >
            Ver todos →
          </Link>
        </div>

        {resultados.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-borde bg-superficie p-12 text-center text-musgo">
            Todavía no hay anuncios publicados. Sé el primero en vender tu carro acá.
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
