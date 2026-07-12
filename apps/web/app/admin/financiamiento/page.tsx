'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth';

interface Entidad {
  id: number;
  nombre: string;
  logoUrl: string | null;
  activo: boolean;
  _count: { planes: number };
}

interface Plan {
  id: number;
  entidadId: number;
  nombre: string;
  tasaAnual: string;
  plazoMin: number;
  plazoMax: number;
  engancheMinPct: string;
  aplicaA: 'todos' | 'verificados' | 'concesionario';
  activo: boolean;
  entidad: { nombre: string };
}

const APLICA_A = ['todos', 'verificados', 'concesionario'] as const;

const FORM_VACIO = {
  id: 0,
  nombre: '',
  tasaAnual: '',
  plazoMin: '12',
  plazoMax: '60',
  engancheMinPct: '20',
  aplicaA: 'todos' as Plan['aplicaA'],
};

export default function AdminFinanciamientoPage() {
  const { fetchAuth } = useAuth();
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [seleccion, setSeleccion] = useState<Entidad | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [nuevaEntidad, setNuevaEntidad] = useState('');
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [error, setError] = useState('');

  const cargarEntidades = useCallback(async () => {
    const res = await fetchAuth('/admin/financiamiento/entidades');
    if (res.ok) setEntidades(await res.json());
  }, [fetchAuth]);

  const cargarPlanes = useCallback(
    async (entidadId: number) => {
      const res = await fetchAuth(`/admin/financiamiento/planes?entidadId=${entidadId}`);
      if (res.ok) setPlanes(await res.json());
    },
    [fetchAuth],
  );

  useEffect(() => {
    void cargarEntidades();
  }, [cargarEntidades]);

  function seleccionar(e: Entidad) {
    setSeleccion(e);
    setForm({ ...FORM_VACIO });
    void cargarPlanes(e.id);
  }

  async function enviar(ruta: string, method: string, body?: object): Promise<boolean> {
    setError('');
    const res = await fetchAuth(ruta, {
      method,
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? 'La operación falló');
      return false;
    }
    return true;
  }

  async function agregarEntidad(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaEntidad.trim()) return;
    if (await enviar('/admin/financiamiento/entidades', 'POST', { nombre: nuevaEntidad.trim() })) {
      setNuevaEntidad('');
      await cargarEntidades();
    }
  }

  async function renombrarEntidad(ent: Entidad) {
    const nombre = window.prompt('Nuevo nombre de la entidad', ent.nombre)?.trim();
    if (!nombre || nombre === ent.nombre) return;
    if (await enviar(`/admin/financiamiento/entidades/${ent.id}`, 'PATCH', { nombre }))
      await cargarEntidades();
  }

  async function toggleEntidad(ent: Entidad) {
    if (await enviar(`/admin/financiamiento/entidades/${ent.id}`, 'PATCH', { activo: !ent.activo }))
      await cargarEntidades();
  }

  async function guardarPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!seleccion) return;
    const datos = {
      nombre: form.nombre.trim(),
      tasaAnual: Number(form.tasaAnual),
      plazoMin: Number(form.plazoMin),
      plazoMax: Number(form.plazoMax),
      engancheMinPct: Number(form.engancheMinPct),
      aplicaA: form.aplicaA,
    };
    const ok = form.id
      ? await enviar(`/admin/financiamiento/planes/${form.id}`, 'PATCH', datos)
      : await enviar('/admin/financiamiento/planes', 'POST', { entidadId: seleccion.id, ...datos });
    if (ok) {
      setForm({ ...FORM_VACIO });
      await cargarPlanes(seleccion.id);
      await cargarEntidades();
    }
  }

  function editarPlan(p: Plan) {
    setForm({
      id: p.id,
      nombre: p.nombre,
      tasaAnual: p.tasaAnual,
      plazoMin: String(p.plazoMin),
      plazoMax: String(p.plazoMax),
      engancheMinPct: p.engancheMinPct,
      aplicaA: p.aplicaA,
    });
  }

  async function togglePlan(p: Plan) {
    if (!seleccion) return;
    if (await enviar(`/admin/financiamiento/planes/${p.id}`, 'PATCH', { activo: !p.activo }))
      await cargarPlanes(seleccion.id);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Financiamiento</h1>
      <p className="mt-1 text-sm text-musgo">
        Entidades y sus planes (tasa, plazos, enganche). Alimentan el simulador de la ficha.
      </p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Entidades */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-musgo">Entidades</h2>
          <form onSubmit={agregarEntidad} className="mt-2 flex gap-2">
            <input
              value={nuevaEntidad}
              onChange={(e) => setNuevaEntidad(e.target.value)}
              placeholder="Nueva entidad"
              className="flex-1 rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-quetzal px-3 py-1.5 text-sm font-medium text-white hover:bg-quetzal-oscuro"
            >
              Agregar
            </button>
          </form>
          <ul className="mt-3 flex flex-col gap-1">
            {entidades.map((ent) => (
              <li
                key={ent.id}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                  seleccion?.id === ent.id ? 'border-quetzal bg-crema' : 'border-borde bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => seleccionar(ent)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className={`font-medium ${ent.activo ? '' : 'text-musgo line-through'}`}>
                    {ent.nombre}
                  </span>
                  <span className="cifra ml-2 text-xs text-musgo">{ent._count.planes} planes</span>
                </button>
                <button
                  type="button"
                  onClick={() => renombrarEntidad(ent)}
                  className="text-xs text-musgo hover:text-quetzal"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleEntidad(ent)}
                  className={`rounded border px-1.5 py-0.5 text-xs font-medium ${
                    ent.activo ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'
                  }`}
                >
                  {ent.activo ? 'Activa' : 'Inactiva'}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Planes */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-musgo">
            Planes {seleccion ? `de ${seleccion.nombre}` : ''}
          </h2>
          {!seleccion ? (
            <p className="mt-2 text-sm text-musgo">
              Elegí una entidad para ver y crear sus planes.
            </p>
          ) : (
            <>
              <form
                onSubmit={guardarPlan}
                className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-borde bg-white p-3 sm:grid-cols-3"
              >
                <Campo etiqueta="Nombre del plan" ancho="col-span-2 sm:col-span-3">
                  <input
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className={estiloControl}
                  />
                </Campo>
                <Campo etiqueta="Tasa anual %">
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    value={form.tasaAnual}
                    onChange={(e) => setForm({ ...form, tasaAnual: e.target.value })}
                    className={estiloControl}
                  />
                </Campo>
                <Campo etiqueta="Plazo mín (meses)">
                  <input
                    required
                    type="number"
                    min="6"
                    max="120"
                    value={form.plazoMin}
                    onChange={(e) => setForm({ ...form, plazoMin: e.target.value })}
                    className={estiloControl}
                  />
                </Campo>
                <Campo etiqueta="Plazo máx (meses)">
                  <input
                    required
                    type="number"
                    min="6"
                    max="120"
                    value={form.plazoMax}
                    onChange={(e) => setForm({ ...form, plazoMax: e.target.value })}
                    className={estiloControl}
                  />
                </Campo>
                <Campo etiqueta="Enganche mín %">
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    max="90"
                    value={form.engancheMinPct}
                    onChange={(e) => setForm({ ...form, engancheMinPct: e.target.value })}
                    className={estiloControl}
                  />
                </Campo>
                <Campo etiqueta="Aplica a">
                  <select
                    value={form.aplicaA}
                    onChange={(e) =>
                      setForm({ ...form, aplicaA: e.target.value as Plan['aplicaA'] })
                    }
                    className={estiloControl}
                  >
                    {APLICA_A.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Campo>
                <div className="col-span-2 flex gap-2 sm:col-span-3">
                  <button
                    type="submit"
                    className="rounded-md bg-quetzal px-4 py-1.5 text-sm font-medium text-white hover:bg-quetzal-oscuro"
                  >
                    {form.id ? 'Guardar cambios' : 'Agregar plan'}
                  </button>
                  {form.id > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...FORM_VACIO })}
                      className="rounded-md border border-borde px-4 py-1.5 text-sm hover:border-quetzal hover:text-quetzal"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              <ul className="mt-3 flex flex-col gap-2">
                {planes.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-borde bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <span className={`font-medium ${p.activo ? '' : 'text-musgo line-through'}`}>
                        {p.nombre}
                      </span>
                      <span className="cifra ml-2 text-xs text-musgo">
                        {p.tasaAnual}% · {p.plazoMin}–{p.plazoMax} meses · enganche{' '}
                        {p.engancheMinPct}% · {p.aplicaA}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => editarPlan(p)}
                        className="text-xs text-musgo hover:text-quetzal"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePlan(p)}
                        className={`rounded border px-1.5 py-0.5 text-xs font-medium ${
                          p.activo
                            ? 'border-green-600 text-green-700'
                            : 'border-red-600 text-red-700'
                        }`}
                      >
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  </li>
                ))}
                {planes.length === 0 && (
                  <li className="text-sm text-musgo">Esta entidad todavía no tiene planes.</li>
                )}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

const estiloControl =
  'w-full rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none';

function Campo({
  etiqueta,
  ancho,
  children,
}: {
  etiqueta: string;
  ancho?: string;
  children: React.ReactNode;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: el control llega siempre como children
    <label className={`flex flex-col gap-1 ${ancho ?? ''}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-musgo">{etiqueta}</span>
      {children}
    </label>
  );
}
