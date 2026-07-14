'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../lib/auth';
import { formatearPrecio } from '../../lib/formato';

interface Solicitud {
  id: number;
  monto: string;
  enganche: string;
  plazo: number;
  cuotaEstimada: string;
  estado: 'enviada' | 'en_revision' | 'aprobada' | 'rechazada';
  creadoEn: string;
  vehiculo: { slug: string; anio: number; marca: { nombre: string }; modelo: { nombre: string } };
  plan: { nombre: string; entidad: { nombre: string } };
}

const ESTADO_CLASE: Record<string, string> = {
  enviada: 'bg-lienzo text-musgo',
  en_revision: 'bg-amber-100 text-amber-800',
  aprobada: 'bg-green-100 text-green-800',
  rechazada: 'bg-red-100 text-red-800',
};

export default function MisSolicitudesPage() {
  const t = useT();
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/solicitudes/mias');
    if (res.ok) setSolicitudes(await res.json());
  }, [fetchAuth]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/entrar?destino=/solicitudes');
      return;
    }
    void cargar();
  }, [cargando, usuario, router, cargar]);

  if (cargando || !usuario) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-musgo">{t('common.loading')}</main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">{t('solicitudes.title')}</h1>
      <p className="mt-1 text-sm text-musgo">{t('solicitudes.subtitle')}</p>

      {solicitudes && solicitudes.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          {t('solicitudes.empty')}
          <div>
            <Link
              href="/autos"
              className="mt-3 inline-block font-medium text-acento hover:underline"
            >
              {t('solicitudes.explore')}
            </Link>
          </div>
        </div>
      )}

      {solicitudes && solicitudes.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {solicitudes.map((s) => {
            const estadoClase = ESTADO_CLASE[s.estado];
            const moneda = 'GTQ' as const;
            return (
              <li key={s.id} className="rounded-lg border border-borde bg-superficie p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/autos/${s.vehiculo.slug}`}
                      className="font-medium hover:text-acento"
                    >
                      {s.vehiculo.marca.nombre} {s.vehiculo.modelo.nombre} {s.vehiculo.anio}
                    </Link>
                    <p className="text-xs text-musgo">
                      {s.plan.entidad.nombre} · {s.plan.nombre}
                    </p>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${estadoClase}`}>
                    {t(`solicitudes.estado.${s.estado}`)}
                  </span>
                </div>
                <p className="cifra mt-2 text-sm text-musgo">
                  {t('solicitudes.summary', {
                    cuota: formatearPrecio(s.cuotaEstimada, moneda),
                    plazo: s.plazo,
                    enganche: formatearPrecio(s.enganche, moneda),
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
