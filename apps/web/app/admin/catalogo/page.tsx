'use client';

import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { LookupCatalogo } from '../../../components/lookup-catalogo';
import { useAuth } from '../../../lib/auth';

interface Marca {
  id: number;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  activo: boolean;
  _count: { modelos: number; vehiculos: number };
}

interface Modelo {
  id: number;
  nombre: string;
  slug: string;
  activo: boolean;
  _count: { vehiculos: number };
}

export default function AdminCatalogoPage() {
  const t = useT();
  const { fetchAuth } = useAuth();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [seleccion, setSeleccion] = useState<Marca | null>(null);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [error, setError] = useState('');

  const cargarMarcas = useCallback(async () => {
    const res = await fetchAuth('/admin/catalogo/marcas');
    if (res.ok) setMarcas(await res.json());
    else setError(t('admin.catalogo.brandsError'));
  }, [fetchAuth, t]);

  const cargarModelos = useCallback(
    async (marcaId: number) => {
      const res = await fetchAuth(`/admin/catalogo/marcas/${marcaId}/modelos`);
      if (res.ok) setModelos(await res.json());
    },
    [fetchAuth],
  );

  useEffect(() => {
    void cargarMarcas();
  }, [cargarMarcas]);

  function seleccionar(m: Marca) {
    setSeleccion(m);
    setNuevoModelo('');
    void cargarModelos(m.id);
  }

  async function enviar(ruta: string, method: string, body: object): Promise<boolean> {
    setError('');
    const res = await fetchAuth(ruta, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? t('admin.catalogo.opFailed'));
      return false;
    }
    return true;
  }

  async function agregarMarca(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaMarca.trim()) return;
    if (await enviar('/admin/catalogo/marcas', 'POST', { nombre: nuevaMarca.trim() })) {
      setNuevaMarca('');
      await cargarMarcas();
    }
  }

  async function renombrarMarca(m: Marca) {
    const nombre = window.prompt(t('admin.catalogo.renameBrand'), m.nombre)?.trim();
    if (!nombre || nombre === m.nombre) return;
    if (await enviar(`/admin/catalogo/marcas/${m.id}`, 'PATCH', { nombre })) await cargarMarcas();
  }

  async function alternarMarca(m: Marca) {
    if (await enviar(`/admin/catalogo/marcas/${m.id}`, 'PATCH', { activo: !m.activo }))
      await cargarMarcas();
  }

  async function agregarModelo(e: React.FormEvent) {
    e.preventDefault();
    if (!seleccion || !nuevoModelo.trim()) return;
    if (
      await enviar(`/admin/catalogo/marcas/${seleccion.id}/modelos`, 'POST', {
        nombre: nuevoModelo.trim(),
      })
    ) {
      setNuevoModelo('');
      await cargarModelos(seleccion.id);
      await cargarMarcas();
    }
  }

  async function renombrarModelo(mod: Modelo) {
    if (!seleccion) return;
    const nombre = window.prompt(t('admin.catalogo.renameModel'), mod.nombre)?.trim();
    if (!nombre || nombre === mod.nombre) return;
    if (await enviar(`/admin/catalogo/modelos/${mod.id}`, 'PATCH', { nombre }))
      await cargarModelos(seleccion.id);
  }

  async function alternarModelo(mod: Modelo) {
    if (!seleccion) return;
    if (await enviar(`/admin/catalogo/modelos/${mod.id}`, 'PATCH', { activo: !mod.activo }))
      await cargarModelos(seleccion.id);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {t('admin.catalogo.title')}
      </h1>
      <p className="mt-1 text-sm text-musgo">{t('admin.catalogo.subtitle')}</p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Marcas */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-musgo">
            {t('admin.catalogo.brands')}
          </h2>
          <form onSubmit={agregarMarca} className="mt-2 flex gap-2">
            <input
              value={nuevaMarca}
              onChange={(e) => setNuevaMarca(e.target.value)}
              placeholder={t('admin.catalogo.newBrand')}
              className="flex-1 rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-white hover:bg-acento-oscuro"
            >
              {t('admin.catalogo.add')}
            </button>
          </form>

          <ul className="mt-3 flex flex-col gap-1">
            {marcas.map((m) => (
              <li
                key={m.id}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                  seleccion?.id === m.id ? 'border-acento bg-crema' : 'border-borde bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => seleccionar(m)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className={`font-medium ${m.activo ? '' : 'text-musgo line-through'}`}>
                    {m.nombre}
                  </span>
                  <span className="cifra ml-2 text-xs text-musgo">
                    {t('admin.catalogo.countModels', {
                      modelos: m._count.modelos,
                      anuncios: m._count.vehiculos,
                    })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => renombrarMarca(m)}
                  className="text-xs text-musgo hover:text-acento"
                >
                  {t('admin.catalogo.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => alternarMarca(m)}
                  className={`rounded border px-1.5 py-0.5 text-xs font-medium ${
                    m.activo ? 'border-green-600 text-green-700' : 'border-red-600 text-red-700'
                  }`}
                >
                  {m.activo ? t('admin.catalogo.activeF') : t('admin.catalogo.inactiveF')}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Modelos de la marca seleccionada */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-musgo">
            {seleccion
              ? t('admin.catalogo.modelsOf', { marca: seleccion.nombre })
              : t('admin.catalogo.models')}
          </h2>
          {!seleccion ? (
            <p className="mt-2 text-sm text-musgo">{t('admin.catalogo.pickBrand')}</p>
          ) : (
            <>
              <form onSubmit={agregarModelo} className="mt-2 flex gap-2">
                <input
                  value={nuevoModelo}
                  onChange={(e) => setNuevoModelo(e.target.value)}
                  placeholder={t('admin.catalogo.newModelOf', { marca: seleccion.nombre })}
                  className="flex-1 rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-white hover:bg-acento-oscuro"
                >
                  {t('admin.catalogo.add')}
                </button>
              </form>

              <ul className="mt-3 flex flex-col gap-1">
                {modelos.map((mod) => (
                  <li
                    key={mod.id}
                    className="flex items-center gap-2 rounded-md border border-borde bg-white px-3 py-2"
                  >
                    <span
                      className={`min-w-0 flex-1 font-medium ${mod.activo ? '' : 'text-musgo line-through'}`}
                    >
                      {mod.nombre}
                      <span className="cifra ml-2 text-xs text-musgo">
                        {t('admin.catalogo.countListings', { n: mod._count.vehiculos })}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => renombrarModelo(mod)}
                      className="text-xs text-musgo hover:text-acento"
                    >
                      {t('admin.catalogo.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarModelo(mod)}
                      className={`rounded border px-1.5 py-0.5 text-xs font-medium ${
                        mod.activo
                          ? 'border-green-600 text-green-700'
                          : 'border-red-600 text-red-700'
                      }`}
                    >
                      {mod.activo ? t('admin.catalogo.activeM') : t('admin.catalogo.inactiveM')}
                    </button>
                  </li>
                ))}
                {modelos.length === 0 && (
                  <li className="text-sm text-musgo">{t('admin.catalogo.noModels')}</li>
                )}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <LookupCatalogo titulo={t('admin.catalogo.bodyTypes')} endpoint="carrocerias" />
        <LookupCatalogo titulo={t('admin.catalogo.fuels')} endpoint="combustibles" />
        <LookupCatalogo
          titulo={t('admin.catalogo.features')}
          endpoint="caracteristicas"
          conCategoria
        />
      </div>
    </div>
  );
}
