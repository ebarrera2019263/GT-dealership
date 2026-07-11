import type { Marca } from '@/lib/api';

/**
 * Formulario GET puro: el estado de los filtros vive en la URL, el listado se
 * renderiza en el servidor y cada búsqueda es compartible por link.
 */
export function Filtros({
  marcas,
  carrocerias,
  valores,
}: {
  marcas: Marca[];
  carrocerias: Marca[];
  valores: Record<string, string | undefined>;
}) {
  return (
    <form method="get" action="/autos" className="flex flex-col gap-3">
      <Campo etiqueta="Marca">
        <select name="marca" defaultValue={valores.marca ?? ''} className={estiloControl}>
          <option value="">Todas</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.slug}>
              {m.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Carrocería">
        <select name="carroceria" defaultValue={valores.carroceria ?? ''} className={estiloControl}>
          <option value="">Todas</option>
          {carrocerias.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-2">
        <Campo etiqueta="Precio máx. (Q)">
          <input
            type="number"
            name="precioMax"
            min={0}
            step={5000}
            defaultValue={valores.precioMax ?? ''}
            placeholder="250,000"
            className={estiloControl}
          />
        </Campo>
        <Campo etiqueta="Año desde">
          <input
            type="number"
            name="anioMin"
            min={1950}
            max={new Date().getFullYear() + 1}
            defaultValue={valores.anioMin ?? ''}
            placeholder="2015"
            className={estiloControl}
          />
        </Campo>
      </div>

      <Campo etiqueta="Ordenar por">
        <select name="orden" defaultValue={valores.orden ?? 'recientes'} className={estiloControl}>
          <option value="recientes">Más recientes</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="km_asc">Menos kilometraje</option>
          <option value="anio_desc">Año: más nuevo</option>
        </select>
      </Campo>

      <button
        type="submit"
        className="mt-1 rounded-md bg-quetzal px-4 py-2 font-medium text-white hover:bg-quetzal-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quetzal"
      >
        Buscar
      </button>
    </form>
  );
}

const estiloControl =
  'w-full rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none';

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-musgo">{etiqueta}</span>
      {children}
    </label>
  );
}
