'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../lib/auth';

interface VehiculoRef {
  id: number;
  slug: string;
  anio: number;
  marca: { nombre: string };
  modelo: { nombre: string };
}

interface Cita {
  id: number;
  fecha: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  vehiculo: VehiculoRef;
  comprador?: { nombre: string };
}

const BADGE: Record<Cita['estado'], string> = {
  pendiente: 'bg-lienzo text-musgo',
  confirmada: 'bg-acento/10 text-acento',
  cancelada: 'bg-red-50 text-red-700',
};

function fmtFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Guatemala',
  }).format(new Date(iso));
}

function anuncio(v: VehiculoRef): string {
  return `${v.marca.nombre} ${v.modelo.nombre} ${v.anio}`;
}

export default function CitasPage() {
  const t = useT();
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [mias, setMias] = useState<Cita[] | null>(null);
  const [recibidas, setRecibidas] = useState<Cita[]>([]);

  const cargar = useCallback(async () => {
    const [rMias, rRecibidas] = await Promise.all([
      fetchAuth('/citas'),
      fetchAuth('/citas/recibidas'),
    ]);
    if (rMias.ok) setMias(await rMias.json());
    if (rRecibidas.ok) setRecibidas(await rRecibidas.json());
  }, [fetchAuth]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/entrar?destino=/citas');
      return;
    }
    void cargar();
  }, [cargando, usuario, router, cargar]);

  async function accion(id: number, verbo: 'confirmar' | 'cancelar') {
    const res = await fetchAuth(`/citas/${id}/${verbo}`, { method: 'PATCH' });
    if (res.ok) void cargar();
  }

  if (cargando || mias === null) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-musgo">{t('common.loading')}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{t('citas.title')}</h1>
      <p className="mt-1 text-sm text-musgo">{t('citas.subtitle')}</p>

      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wide text-musgo">
          {t('citas.requestedByMe')}
        </h2>
        {mias.length === 0 ? (
          <p className="mt-3 rounded-lg border border-borde bg-papel px-4 py-6 text-center text-sm text-musgo">
            {(() => {
              const [antes, despues] = t('citas.emptyMine').split('{link}');
              return (
                <>
                  {antes}
                  <Link href="/autos" className="font-medium text-acento hover:underline">
                    {t('citas.vehicleLink')}
                  </Link>
                  {despues}
                </>
              );
            })()}
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {mias.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-borde bg-superficie p-4"
              >
                <div>
                  <Link
                    href={`/autos/${c.vehiculo.slug}`}
                    className="font-medium hover:text-acento"
                  >
                    {anuncio(c.vehiculo)}
                  </Link>
                  <p className="mt-0.5 text-sm text-musgo">{fmtFecha(c.fecha)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[c.estado]}`}
                  >
                    {t(`citas.estado.${c.estado}`)}
                  </span>
                  {c.estado !== 'cancelada' && (
                    <button
                      type="button"
                      onClick={() => accion(c.id, 'cancelar')}
                      className="text-sm text-musgo hover:text-red-700"
                    >
                      {t('citas.cancel')}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recibidas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-musgo">
            {t('citas.toMyListings')}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {recibidas.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-borde bg-superficie p-4"
              >
                <div>
                  <Link
                    href={`/autos/${c.vehiculo.slug}`}
                    className="font-medium hover:text-acento"
                  >
                    {anuncio(c.vehiculo)}
                  </Link>
                  <p className="mt-0.5 text-sm text-musgo">
                    {fmtFecha(c.fecha)}
                    {c.comprador ? ` · ${c.comprador.nombre}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[c.estado]}`}
                  >
                    {t(`citas.estado.${c.estado}`)}
                  </span>
                  {c.estado === 'pendiente' && (
                    <button
                      type="button"
                      onClick={() => accion(c.id, 'confirmar')}
                      className="rounded-md bg-acento px-3 py-1 text-sm font-medium text-white hover:bg-acento-oscuro"
                    >
                      {t('citas.confirm')}
                    </button>
                  )}
                  {c.estado !== 'cancelada' && (
                    <button
                      type="button"
                      onClick={() => accion(c.id, 'cancelar')}
                      className="text-sm text-musgo hover:text-red-700"
                    >
                      {t('citas.cancel')}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
