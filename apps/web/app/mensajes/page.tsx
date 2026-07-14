'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../lib/auth';

interface ConversacionResumen {
  id: number;
  vehiculo: {
    slug: string;
    anio: number;
    marca: { nombre: string };
    modelo: { nombre: string };
    imagenes: { urlThumb: string | null; url: string }[];
  } | null;
  contraparte: { id: number; nombre: string };
  rolPropio: 'comprador' | 'vendedor';
  ultimoMensaje: { contenido: string; creadoEn: string; emisorId: number } | null;
  noLeidos: number;
}

function cuando(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
}

export default function MensajesPage() {
  const t = useT();
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [convs, setConvs] = useState<ConversacionResumen[] | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/conversaciones');
    if (res.ok) setConvs(await res.json());
  }, [fetchAuth]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/entrar?destino=/mensajes');
      return;
    }
    void cargar();
  }, [cargando, usuario, router, cargar]);

  if (cargando || !usuario) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-musgo">{t('common.loading')}</main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">{t('mensajes.title')}</h1>

      {convs && convs.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          {t('mensajes.empty')}
        </div>
      )}

      <ul className="mt-6 flex flex-col divide-y divide-borde rounded-lg border border-borde bg-superficie">
        {convs?.map((c) => {
          const thumb = c.vehiculo?.imagenes[0]?.urlThumb ?? c.vehiculo?.imagenes[0]?.url;
          return (
            <li key={c.id}>
              <Link
                href={`/mensajes/${c.id}`}
                className="flex items-center gap-3 p-3 hover:bg-papel"
              >
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-papel">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">
                      {c.vehiculo
                        ? `${c.vehiculo.marca.nombre} ${c.vehiculo.modelo.nombre} ${c.vehiculo.anio}`
                        : t('mensajes.listingUnavailable')}
                    </p>
                    <span className="shrink-0 text-xs text-musgo">
                      {cuando(c.ultimoMensaje?.creadoEn ?? null)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-musgo">
                    <span className="text-xs uppercase tracking-wide">
                      {c.rolPropio === 'comprador' ? t('mensajes.seller') : t('mensajes.buyer')}:{' '}
                      {c.contraparte.nombre}
                    </span>
                    {c.ultimoMensaje && <> · {c.ultimoMensaje.contenido}</>}
                  </p>
                </div>
                {c.noLeidos > 0 && (
                  <span className="ml-1 shrink-0 rounded-full bg-acento px-2 py-0.5 text-xs font-semibold text-white">
                    {c.noLeidos}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
