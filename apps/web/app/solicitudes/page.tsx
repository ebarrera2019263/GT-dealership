'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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

const ESTADO_UI: Record<string, { texto: string; clase: string }> = {
  enviada: { texto: 'Enviada', clase: 'bg-crema text-musgo' },
  en_revision: { texto: 'En revisión', clase: 'bg-amber-100 text-amber-800' },
  aprobada: { texto: 'Aprobada', clase: 'bg-green-100 text-green-800' },
  rechazada: { texto: 'Rechazada', clase: 'bg-red-100 text-red-800' },
};

export default function MisSolicitudesPage() {
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
    return <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Mis solicitudes de crédito</h1>
      <p className="mt-1 text-sm text-musgo">Estado de tus trámites de financiamiento.</p>

      {solicitudes && solicitudes.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          Todavía no enviaste ninguna solicitud. Simulá y solicitá desde cualquier anuncio.
          <div>
            <Link
              href="/autos"
              className="mt-3 inline-block font-medium text-quetzal hover:underline"
            >
              Explorar vehículos
            </Link>
          </div>
        </div>
      )}

      {solicitudes && solicitudes.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {solicitudes.map((s) => {
            const ui = ESTADO_UI[s.estado];
            const moneda = 'GTQ' as const;
            return (
              <li key={s.id} className="rounded-lg border border-borde bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/autos/${s.vehiculo.slug}`}
                      className="font-medium hover:text-quetzal"
                    >
                      {s.vehiculo.marca.nombre} {s.vehiculo.modelo.nombre} {s.vehiculo.anio}
                    </Link>
                    <p className="text-xs text-musgo">
                      {s.plan.entidad.nombre} · {s.plan.nombre}
                    </p>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${ui.clase}`}>
                    {ui.texto}
                  </span>
                </div>
                <p className="cifra mt-2 text-sm text-musgo">
                  Cuota estimada {formatearPrecio(s.cuotaEstimada, moneda)}/mes · {s.plazo} meses ·
                  enganche {formatearPrecio(s.enganche, moneda)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
