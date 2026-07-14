'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../lib/auth';
import { formatearPrecio } from '../../lib/formato';

interface VehiculoPanel {
  id: number;
  slug: string;
  estado: string;
  anio: number;
  precio: string;
  moneda: 'GTQ' | 'USD';
  vistas: number;
  contactos: number;
  marca: { nombre: string };
  modelo: { nombre: string };
  imagenes: { urlThumb: string | null; url: string }[];
}

// Color de cada estado (máquina de estados del esquema §4). La etiqueta se
// traduce con `panel.estado.<estado>`.
const ESTADO_CLASE: Record<string, string> = {
  borrador: 'bg-borde text-tinta',
  en_revision: 'bg-ambar/20 text-ambar',
  publicado: 'bg-acento/15 text-acento',
  rechazado: 'bg-red-100 text-red-700',
  pausado: 'bg-borde text-musgo',
  expirado: 'bg-borde text-musgo',
  vendido: 'bg-tinta text-papel',
};

// Estados en los que el vendedor puede editar el contenido del anuncio.
const EDITABLE = new Set(['borrador', 'rechazado', 'pausado']);

// Acciones disponibles según el estado actual (endpoint = acción). `label` es la
// clave de traducción bajo `panel.accion.<label>`.
const ACCIONES: Record<string, { accion: string; label: string; primaria?: boolean }[]> = {
  borrador: [{ accion: 'publicar', label: 'sendToReview', primaria: true }],
  rechazado: [{ accion: 'publicar', label: 'resendToReview', primaria: true }],
  expirado: [{ accion: 'publicar', label: 'resendToReview', primaria: true }],
  publicado: [
    { accion: 'pausar', label: 'pause' },
    { accion: 'vendido', label: 'markSold' },
  ],
  pausado: [
    { accion: 'reactivar', label: 'reactivate', primaria: true },
    { accion: 'vendido', label: 'markSold' },
  ],
};

export default function PanelPage() {
  const t = useT();
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<VehiculoPanel[] | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/mi/vehiculos');
    if (!res.ok) {
      setError(t('panel.loadError'));
      return;
    }
    setVehiculos(await res.json());
  }, [fetchAuth, t]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/entrar?destino=/panel');
      return;
    }
    void cargar();
  }, [cargando, usuario, router, cargar]);

  async function ejecutar(id: number, accion: string) {
    setOcupado(id);
    setError('');
    const res = await fetchAuth(`/mi/vehiculos/${id}/${accion}`, { method: 'POST' });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? cuerpo?.errores?.[0]?.detalle ?? t('panel.actionError'));
    } else {
      await cargar();
    }
    setOcupado(null);
  }

  if (cargando || (!usuario && !error)) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-musgo">{t('common.loading')}</main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('panel.title')}</h1>
        <Link
          href="/panel/publicar"
          className="rounded-md bg-acento px-3 py-2 text-sm font-medium text-white hover:bg-acento-oscuro"
        >
          {t('panel.publishVehicle')}
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {vehiculos && vehiculos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(() => {
            const publicados = vehiculos.filter((v) => v.estado === 'publicado').length;
            const totalVistas = vehiculos.reduce((s, v) => s + v.vistas, 0);
            const totalContactos = vehiculos.reduce((s, v) => s + v.contactos, 0);
            const metricas: [string, number][] = [
              [t('panel.metricListings'), vehiculos.length],
              [t('panel.metricPublished'), publicados],
              [t('panel.metricViews'), totalVistas],
              [t('panel.metricContacts'), totalContactos],
            ];
            return metricas.map(([label, valor]) => (
              <div key={label} className="rounded-lg border border-borde bg-superficie p-3">
                <p className="cifra text-2xl font-bold">{valor.toLocaleString('es-GT')}</p>
                <p className="text-xs uppercase tracking-wide text-musgo">{label}</p>
              </div>
            ));
          })()}
        </div>
      )}

      {vehiculos && vehiculos.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center">
          <p className="text-musgo">{t('panel.emptyTitle')}</p>
          <Link
            href="/panel/publicar"
            className="mt-3 inline-block font-medium text-acento hover:underline"
          >
            {t('panel.emptyCta')}
          </Link>
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {vehiculos?.map((v) => {
          const estadoClase = ESTADO_CLASE[v.estado] ?? 'bg-borde text-tinta';
          const acciones = ACCIONES[v.estado] ?? [];
          const thumb = v.imagenes[0]?.urlThumb ?? v.imagenes[0]?.url;
          return (
            <li
              key={v.id}
              className="flex flex-col gap-3 rounded-lg border border-borde bg-superficie p-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-papel">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={`${v.marca.nombre} ${v.modelo.nombre}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-musgo">
                      {t('common.noPhoto')}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {v.marca.nombre} {v.modelo.nombre} {v.anio}
                  </p>
                  <p className="cifra text-sm text-musgo">{formatearPrecio(v.precio, v.moneda)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${estadoClase}`}
                    >
                      {t(`panel.estado.${v.estado}`)}
                    </span>
                    <span className="cifra text-xs text-musgo">
                      {t('panel.viewsContacts', {
                        vistas: v.vistas.toLocaleString('es-GT'),
                        contactos: v.contactos,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {v.estado === 'publicado' && (
                  <Link
                    href={`/autos/${v.slug}`}
                    className="rounded-md border border-borde px-3 py-1.5 text-sm hover:border-acento hover:text-acento"
                  >
                    {t('panel.view')}
                  </Link>
                )}
                {EDITABLE.has(v.estado) && (
                  <Link
                    href={`/panel/vehiculos/${v.id}/editar`}
                    className="rounded-md border border-borde px-3 py-1.5 text-sm hover:border-acento hover:text-acento"
                  >
                    {t('panel.edit')}
                  </Link>
                )}
                {acciones.map((a) => (
                  <button
                    key={a.accion}
                    type="button"
                    disabled={ocupado === v.id}
                    onClick={() => ejecutar(v.id, a.accion)}
                    className={
                      a.primaria
                        ? 'rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-white hover:bg-acento-oscuro disabled:opacity-60'
                        : 'rounded-md border border-borde px-3 py-1.5 text-sm hover:border-acento hover:text-acento disabled:opacity-60'
                    }
                  >
                    {t(`panel.accion.${a.label}`)}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
