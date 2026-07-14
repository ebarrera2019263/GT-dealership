'use client';

import type { Marca } from '@/lib/api';
import { useT } from '@/lib/i18n/provider';

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
  const t = useT();
  return (
    <form method="get" action="/autos" className="flex flex-col gap-3">
      <Campo etiqueta={t('filtros.brand')}>
        <select name="marca" defaultValue={valores.marca ?? ''} className={estiloControl}>
          <option value="">{t('filtros.all')}</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.slug}>
              {m.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta={t('filtros.bodyType')}>
        <select name="carroceria" defaultValue={valores.carroceria ?? ''} className={estiloControl}>
          <option value="">{t('filtros.all')}</option>
          {carrocerias.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-2">
        <Campo etiqueta={t('filtros.maxPrice')}>
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
        <Campo etiqueta={t('filtros.yearFrom')}>
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

      <Campo etiqueta={t('filtros.sortBy')}>
        <select name="orden" defaultValue={valores.orden ?? 'recientes'} className={estiloControl}>
          <option value="recientes">{t('filtros.sortRecent')}</option>
          <option value="precio_asc">{t('filtros.sortPriceAsc')}</option>
          <option value="precio_desc">{t('filtros.sortPriceDesc')}</option>
          <option value="km_asc">{t('filtros.sortKmAsc')}</option>
          <option value="anio_desc">{t('filtros.sortYearDesc')}</option>
        </select>
      </Campo>

      <button
        type="submit"
        className="mt-1 rounded-md bg-acento px-4 py-2 font-medium text-white hover:bg-acento-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
      >
        {t('filtros.search')}
      </button>
    </form>
  );
}

const estiloControl =
  'w-full rounded-md border border-borde bg-papel placeholder:text-musgo px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none';

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: el control llega siempre como children
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-musgo">{etiqueta}</span>
      {children}
    </label>
  );
}
