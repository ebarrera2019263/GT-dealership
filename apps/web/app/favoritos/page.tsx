'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { VehiculoCard } from '../../components/vehiculo-card';
import type { VehiculoResumen } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function FavoritosPage() {
  const t = useT();
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<VehiculoResumen[] | null>(null);

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/favoritos');
    if (res.ok) setVehiculos(await res.json());
  }, [fetchAuth]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/entrar?destino=/favoritos');
      return;
    }
    void cargar();
  }, [cargando, usuario, router, cargar]);

  if (cargando || !usuario) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 text-sm text-musgo">{t('common.loading')}</main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">{t('favoritos.title')}</h1>
      <p className="mt-1 text-sm text-musgo">{t('favoritos.subtitle')}</p>

      {vehiculos && vehiculos.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          {t('favoritos.empty')}
          <div>
            <Link
              href="/autos"
              className="mt-3 inline-block font-medium text-acento hover:underline"
            >
              {t('favoritos.explore')}
            </Link>
          </div>
        </div>
      )}

      {vehiculos && vehiculos.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehiculos.map((v) => (
            <VehiculoCard key={v.id} vehiculo={v} />
          ))}
        </div>
      )}
    </main>
  );
}
