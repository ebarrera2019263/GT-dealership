'use client';

import { MONEDAS, TRACCIONES } from '@concesionario/shared';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import {
  type Caracteristica,
  cargarCaracteristicas,
  cargarCarrocerias,
  cargarCombustibles,
  cargarDepartamentos,
  cargarMarcas,
  cargarModelos,
  cargarTransmisiones,
  type Departamento,
  type OpcionCatalogo,
} from '../lib/catalogo';

const control =
  'w-full rounded-md border border-borde bg-papel placeholder:text-musgo px-3 py-2 text-sm focus:border-acento focus:outline-none';
const etiqueta = 'text-xs font-medium uppercase tracking-wide text-musgo';
const ANIO_ACTUAL = new Date().getFullYear();

// Valores para precargar el formulario en modo edición. Todo opcional: en modo
// crear se pasa vacío.
export interface ValoresVehiculo {
  marcaId?: number;
  modeloId?: number;
  carroceriaId?: number;
  anio?: number;
  version?: string | null;
  precio?: number;
  moneda?: 'GTQ' | 'USD';
  precioNegociable?: boolean;
  kilometraje?: number;
  transmisionId?: number;
  combustibleId?: number;
  cilindrada?: number | null;
  potencia?: number | null;
  puertas?: number | null;
  color?: string | null;
  traccion?: string | null;
  numDuenos?: number | null;
  descripcion?: string | null;
  departamentoId?: number;
  municipioId?: number;
  caracteristicaIds?: number[];
}

export interface PayloadVehiculo {
  marcaId: number;
  modeloId: number;
  carroceriaId: number;
  anio: number;
  version?: string;
  precio: number;
  moneda: string;
  precioNegociable: boolean;
  kilometraje: number;
  transmisionId: number;
  combustibleId: number;
  cilindrada?: number;
  potencia?: number;
  puertas?: number;
  color?: string;
  traccion?: string;
  numDuenos?: number;
  descripcion?: string;
  departamentoId: number;
  municipioId: number;
  caracteristicaIds: number[];
}

interface Catalogo {
  marcas: OpcionCatalogo[];
  carrocerias: OpcionCatalogo[];
  combustibles: OpcionCatalogo[];
  transmisiones: OpcionCatalogo[];
  caracteristicas: Caracteristica[];
  departamentos: Departamento[];
}

function numeroOpcional(valor: FormDataEntryValue | null): number | undefined {
  const s = String(valor ?? '').trim();
  return s === '' ? undefined : Number(s);
}

export function FormularioVehiculo({
  inicial,
  textoSubmit,
  enviando,
  error,
  onSubmit,
}: {
  inicial?: ValoresVehiculo;
  textoSubmit: string;
  enviando: boolean;
  error?: string;
  onSubmit: (payload: PayloadVehiculo) => void;
}) {
  const t = useT();
  const [cat, setCat] = useState<Catalogo | null>(null);
  // Selects encadenados: controlados para que la selección sobreviva a la carga
  // asíncrona del catálogo (clave en modo edición).
  const [marcaId, setMarcaId] = useState<string>(inicial?.marcaId ? String(inicial.marcaId) : '');
  const [modeloId, setModeloId] = useState<string>(
    inicial?.modeloId ? String(inicial.modeloId) : '',
  );
  const [modelos, setModelos] = useState<OpcionCatalogo[]>([]);
  const [departamentoId, setDepartamentoId] = useState<string>(
    inicial?.departamentoId ? String(inicial.departamentoId) : '',
  );
  const [municipioId, setMunicipioId] = useState<string>(
    inicial?.municipioId ? String(inicial.municipioId) : '',
  );

  useEffect(() => {
    Promise.all([
      cargarMarcas(),
      cargarCarrocerias(),
      cargarCombustibles(),
      cargarTransmisiones(),
      cargarCaracteristicas(),
      cargarDepartamentos(),
    ])
      .then(([marcas, carrocerias, combustibles, transmisiones, caracteristicas, departamentos]) =>
        setCat({
          marcas,
          carrocerias,
          combustibles,
          transmisiones,
          caracteristicas,
          departamentos,
        }),
      )
      .catch(() => setCat(null));
  }, []);

  useEffect(() => {
    if (marcaId === '') {
      setModelos([]);
      return;
    }
    cargarModelos(Number(marcaId))
      .then(setModelos)
      .catch(() => setModelos([]));
  }, [marcaId]);

  const municipios = useMemo(
    () => cat?.departamentos.find((d) => String(d.id) === departamentoId)?.municipios ?? [],
    [cat, departamentoId],
  );

  const caracteristicasPorCategoria = useMemo(() => {
    const grupos = new Map<string, Caracteristica[]>();
    for (const c of cat?.caracteristicas ?? []) {
      const lista = grupos.get(c.categoria) ?? [];
      lista.push(c);
      grupos.set(c.categoria, lista);
    }
    return [...grupos.entries()];
  }, [cat]);

  const seleccionadas = useMemo(() => new Set(inicial?.caracteristicaIds ?? []), [inicial]);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSubmit({
      marcaId: Number(f.get('marcaId')),
      modeloId: Number(f.get('modeloId')),
      carroceriaId: Number(f.get('carroceriaId')),
      anio: Number(f.get('anio')),
      version: String(f.get('version') ?? '').trim() || undefined,
      precio: Number(f.get('precio')),
      moneda: String(f.get('moneda')),
      precioNegociable: f.get('precioNegociable') === 'on',
      kilometraje: Number(f.get('kilometraje')),
      transmisionId: Number(f.get('transmisionId')),
      combustibleId: Number(f.get('combustibleId')),
      cilindrada: numeroOpcional(f.get('cilindrada')),
      potencia: numeroOpcional(f.get('potencia')),
      puertas: numeroOpcional(f.get('puertas')),
      color: String(f.get('color') ?? '').trim() || undefined,
      traccion: String(f.get('traccion') ?? '') || undefined,
      numDuenos: numeroOpcional(f.get('numDuenos')),
      descripcion: String(f.get('descripcion') ?? '').trim() || undefined,
      departamentoId: Number(f.get('departamentoId')),
      municipioId: Number(f.get('municipioId')),
      caracteristicaIds: f.getAll('caracteristicaIds').map((v) => Number(v)),
    });
  }

  if (!cat) {
    return <p className="mt-8 text-sm text-musgo">{t('formVehiculo.loadingCatalog')}</p>;
  }

  return (
    <form onSubmit={enviar} className="mt-8 flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.brand')}</span>
          <select
            required
            name="marcaId"
            value={marcaId}
            className={control}
            onChange={(e) => {
              setMarcaId(e.target.value);
              setModeloId('');
            }}
          >
            <option value="">{t('formVehiculo.pickBrand')}</option>
            {cat.marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.model')}</span>
          <select
            required
            name="modeloId"
            disabled={marcaId === ''}
            value={modeloId}
            className={control}
            onChange={(e) => setModeloId(e.target.value)}
          >
            <option value="">
              {marcaId ? t('formVehiculo.pickModel') : t('formVehiculo.pickBrandFirst')}
            </option>
            {modelos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.year')}</span>
          <input
            required
            name="anio"
            type="number"
            min={1950}
            max={ANIO_ACTUAL + 1}
            defaultValue={inicial?.anio}
            className={control}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.bodyType')}</span>
          <select
            required
            name="carroceriaId"
            defaultValue={inicial?.carroceriaId ?? ''}
            className={control}
          >
            <option value="">{t('formVehiculo.pick')}</option>
            {cat.carrocerias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={etiqueta}>{t('formVehiculo.versionOptional')}</span>
          <input
            name="version"
            maxLength={80}
            defaultValue={inicial?.version ?? ''}
            placeholder={t('formVehiculo.versionPlaceholder')}
            className={control}
          />
        </label>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.price')}</span>
          <input
            required
            name="precio"
            type="number"
            min={1}
            step="1"
            defaultValue={inicial?.precio}
            className={`cifra ${control}`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.currency')}</span>
          <select name="moneda" defaultValue={inicial?.moneda ?? 'GTQ'} className={control}>
            {MONEDAS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.mileage')}</span>
          <input
            required
            name="kilometraje"
            type="number"
            min={0}
            defaultValue={inicial?.kilometraje}
            className={`cifra ${control}`}
          />
        </label>
      </section>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="precioNegociable"
          type="checkbox"
          defaultChecked={inicial?.precioNegociable}
          className="accent-acento"
        />
        {t('formVehiculo.negotiable')}
      </label>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.transmission')}</span>
          <select
            required
            name="transmisionId"
            defaultValue={inicial?.transmisionId ?? ''}
            className={control}
          >
            <option value="">{t('formVehiculo.pick')}</option>
            {cat.transmisiones.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.fuel')}</span>
          <select
            required
            name="combustibleId"
            defaultValue={inicial?.combustibleId ?? ''}
            className={control}
          >
            <option value="">{t('formVehiculo.pick')}</option>
            {cat.combustibles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.drivetrainOptional')}</span>
          <select name="traccion" defaultValue={inicial?.traccion ?? ''} className={control}>
            <option value="">—</option>
            {TRACCIONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.colorOptional')}</span>
          <input
            name="color"
            maxLength={40}
            defaultValue={inicial?.color ?? ''}
            className={control}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.doorsOptional')}</span>
          <input
            name="puertas"
            type="number"
            min={2}
            max={6}
            defaultValue={inicial?.puertas ?? undefined}
            className={control}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.ownersOptional')}</span>
          <input
            name="numDuenos"
            type="number"
            min={1}
            max={20}
            defaultValue={inicial?.numDuenos ?? undefined}
            className={control}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.displacementOptional')}</span>
          <input
            name="cilindrada"
            type="number"
            step="0.1"
            min={0}
            max={12}
            defaultValue={inicial?.cilindrada ?? undefined}
            className={control}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.powerOptional')}</span>
          <input
            name="potencia"
            type="number"
            min={1}
            max={2000}
            defaultValue={inicial?.potencia ?? undefined}
            className={control}
          />
        </label>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.department')}</span>
          <select
            required
            name="departamentoId"
            value={departamentoId}
            className={control}
            onChange={(e) => {
              setDepartamentoId(e.target.value);
              setMunicipioId('');
            }}
          >
            <option value="">{t('formVehiculo.pick')}</option>
            {cat.departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={etiqueta}>{t('formVehiculo.municipality')}</span>
          <select
            required
            name="municipioId"
            disabled={departamentoId === ''}
            value={municipioId}
            className={control}
            onChange={(e) => setMunicipioId(e.target.value)}
          >
            <option value="">
              {departamentoId ? t('formVehiculo.pick') : t('formVehiculo.pickDeptFirst')}
            </option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
      </section>

      <label className="flex flex-col gap-1">
        <span className={etiqueta}>{t('formVehiculo.descriptionOptional')}</span>
        <textarea
          name="descripcion"
          maxLength={5000}
          rows={4}
          defaultValue={inicial?.descripcion ?? ''}
          placeholder={t('formVehiculo.descriptionPlaceholder')}
          className={control}
        />
      </label>

      {caracteristicasPorCategoria.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className={etiqueta}>{t('formVehiculo.equipment')}</legend>
          {caracteristicasPorCategoria.map(([categoria, items]) => (
            <div key={categoria}>
              <p className="mb-1 text-sm font-medium capitalize">{categoria}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {items.map((c) => (
                  <label key={c.id} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      name="caracteristicaIds"
                      value={c.id}
                      defaultChecked={seleccionadas.has(c.id)}
                      className="accent-acento"
                    />
                    {c.nombre}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </fieldset>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-md bg-acento px-5 py-2.5 font-medium text-white hover:bg-acento-oscuro disabled:opacity-60"
      >
        {enviando ? t('formVehiculo.saving') : textoSubmit}
      </button>
    </form>
  );
}
