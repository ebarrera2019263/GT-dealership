'use client';

import { MONEDAS, TRACCIONES } from '@concesionario/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type Imagen, UploaderFotos } from '../../../components/uploader-fotos';
import { useAuth } from '../../../lib/auth';
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
} from '../../../lib/catalogo';

const control =
  'w-full rounded-md border border-borde bg-white px-3 py-2 text-sm focus:border-quetzal focus:outline-none';
const etiqueta = 'text-xs font-medium uppercase tracking-wide text-musgo';

const ANIO_ACTUAL = new Date().getFullYear();

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

export default function PublicarPage() {
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();

  const [cat, setCat] = useState<Catalogo | null>(null);
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [modelos, setModelos] = useState<OpcionCatalogo[]>([]);
  const [departamentoId, setDepartamentoId] = useState<number | null>(null);

  const [vehiculoId, setVehiculoId] = useState<number | null>(null);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [estado, setEstado] = useState<'inicial' | 'enviando'>('inicial');
  const [error, setError] = useState('');

  // Guard de sesión
  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace('/entrar?destino=/panel/publicar');
    }
  }, [cargando, usuario, router]);

  // Cargar catálogo una vez
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
      .catch(() => setError('No se pudo cargar el catálogo'));
  }, []);

  // Cascada marca → modelos
  useEffect(() => {
    if (marcaId == null) {
      setModelos([]);
      return;
    }
    cargarModelos(marcaId)
      .then(setModelos)
      .catch(() => setModelos([]));
  }, [marcaId]);

  const municipios = useMemo(
    () => cat?.departamentos.find((d) => d.id === departamentoId)?.municipios ?? [],
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

  async function crear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const caracteristicaIds = f.getAll('caracteristicaIds').map((v) => Number(v));

    const payload = {
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
      caracteristicaIds,
    };

    setEstado('enviando');
    setError('');
    const res = await fetchAuth('/mi/vehiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const cuerpo = await res.json().catch(() => null);
    if (!res.ok) {
      setError(cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? 'No se pudo crear el anuncio');
      setEstado('inicial');
      return;
    }
    setVehiculoId(cuerpo.id);
    setEstado('inicial');
  }

  async function enviarARevision() {
    if (!vehiculoId) return;
    if (imagenes.length === 0) {
      setError('Agregá al menos una foto antes de enviar a revisión.');
      return;
    }
    setEstado('enviando');
    setError('');
    const res = await fetchAuth(`/mi/vehiculos/${vehiculoId}/publicar`, { method: 'POST' });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? 'No se pudo enviar a revisión');
      setEstado('inicial');
      return;
    }
    router.push('/panel');
  }

  if (cargando || !usuario) {
    return <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  // ── Paso 2: fotos ──
  if (vehiculoId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-wide text-quetzal">Paso 2 de 2</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Agregá las fotos</h1>
        <p className="mt-1 text-sm text-musgo">
          Un buen set de fotos vende más rápido. Cuando termines, enviá el anuncio a revisión.
        </p>
        <div className="mt-8">
          <UploaderFotos vehiculoId={vehiculoId} inicial={imagenes} onCambio={setImagenes} />
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={enviarARevision}
            disabled={estado === 'enviando'}
            className="rounded-md bg-quetzal px-4 py-2 font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
          >
            {estado === 'enviando' ? 'Enviando…' : 'Enviar a revisión'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/panel')}
            className="text-sm text-musgo hover:text-quetzal"
          >
            Guardar como borrador
          </button>
        </div>
      </main>
    );
  }

  // ── Paso 1: datos ──
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-quetzal">Paso 1 de 2</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Publicar vehículo</h1>
      <p className="mt-1 text-sm text-musgo">
        Completá los datos. Después vas a poder subir las fotos.
      </p>

      {!cat ? (
        <p className="mt-8 text-sm text-musgo">Cargando catálogo…</p>
      ) : (
        <form onSubmit={crear} className="mt-8 flex flex-col gap-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Marca</span>
              <select
                required
                name="marcaId"
                className={control}
                onChange={(e) => setMarcaId(Number(e.target.value) || null)}
              >
                <option value="">Elegí una marca</option>
                {cat.marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Modelo</span>
              <select required name="modeloId" disabled={!marcaId} className={control}>
                <option value="">{marcaId ? 'Elegí un modelo' : 'Elegí la marca primero'}</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Año</span>
              <input
                required
                name="anio"
                type="number"
                min={1950}
                max={ANIO_ACTUAL + 1}
                className={control}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Carrocería</span>
              <select required name="carroceriaId" className={control}>
                <option value="">Elegí</option>
                {cat.carrocerias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className={etiqueta}>Versión (opcional)</span>
              <input
                name="version"
                maxLength={80}
                placeholder="Ej. XLT, Limited"
                className={control}
              />
            </label>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Precio</span>
              <input
                required
                name="precio"
                type="number"
                min={1}
                step="1"
                className={`cifra ${control}`}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Moneda</span>
              <select name="moneda" defaultValue="GTQ" className={control}>
                {MONEDAS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Kilometraje</span>
              <input
                required
                name="kilometraje"
                type="number"
                min={0}
                className={`cifra ${control}`}
              />
            </label>
          </section>

          <label className="flex items-center gap-2 text-sm">
            <input name="precioNegociable" type="checkbox" className="accent-quetzal" />
            Precio negociable
          </label>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Transmisión</span>
              <select required name="transmisionId" className={control}>
                <option value="">Elegí</option>
                {cat.transmisiones.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Combustible</span>
              <select required name="combustibleId" className={control}>
                <option value="">Elegí</option>
                {cat.combustibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Tracción (opcional)</span>
              <select name="traccion" defaultValue="" className={control}>
                <option value="">—</option>
                {TRACCIONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Color (opcional)</span>
              <input name="color" maxLength={40} className={control} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Puertas (opcional)</span>
              <input name="puertas" type="number" min={2} max={6} className={control} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Dueños anteriores (opcional)</span>
              <input name="numDuenos" type="number" min={1} max={20} className={control} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Cilindrada L (opcional)</span>
              <input
                name="cilindrada"
                type="number"
                step="0.1"
                min={0}
                max={12}
                className={control}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Potencia HP (opcional)</span>
              <input name="potencia" type="number" min={1} max={2000} className={control} />
            </label>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Departamento</span>
              <select
                required
                name="departamentoId"
                className={control}
                onChange={(e) => setDepartamentoId(Number(e.target.value) || null)}
              >
                <option value="">Elegí</option>
                {cat.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={etiqueta}>Municipio</span>
              <select required name="municipioId" disabled={!departamentoId} className={control}>
                <option value="">
                  {departamentoId ? 'Elegí' : 'Elegí el departamento primero'}
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
            <span className={etiqueta}>Descripción (opcional)</span>
            <textarea
              name="descripcion"
              maxLength={5000}
              rows={4}
              placeholder="Estado general, mantenimientos, detalles…"
              className={control}
            />
          </label>

          {caracteristicasPorCategoria.length > 0 && (
            <fieldset className="flex flex-col gap-3">
              <legend className={etiqueta}>Equipamiento</legend>
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
                          className="accent-quetzal"
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
            disabled={estado === 'enviando'}
            className="self-start rounded-md bg-quetzal px-5 py-2.5 font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
          >
            {estado === 'enviando' ? 'Guardando…' : 'Continuar a las fotos'}
          </button>
        </form>
      )}
    </main>
  );
}
