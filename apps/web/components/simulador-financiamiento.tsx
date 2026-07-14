'use client';

import { calcularCuotaNivelada } from '@concesionario/shared';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../lib/auth';
import { formatearPrecio } from '../lib/formato';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface Plan {
  id: number;
  nombre: string;
  tasaAnual: string;
  plazoMin: number;
  plazoMax: number;
  engancheMinPct: string;
  aplicaA: 'todos' | 'verificados' | 'concesionario';
  entidad: { nombre: string };
}

function redondear(n: number): number {
  return Math.round(n);
}

// Plazos ofrecidos dentro del rango del plan: cada 12 meses + los extremos.
function opcionesPlazo(min: number, max: number): number[] {
  const set = new Set<number>([min, max]);
  for (let p = Math.ceil(min / 12) * 12; p < max; p += 12) set.add(p);
  return [...set].sort((a, b) => a - b);
}

export function SimuladorFinanciamiento({
  vehiculoId,
  precio,
  moneda,
  verificado,
}: {
  vehiculoId: number;
  precio: string;
  moneda: 'GTQ' | 'USD';
  verificado: boolean;
}) {
  const t = useT();
  const { usuario, fetchAuth } = useAuth();
  const precioNum = Number(precio);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [enganche, setEnganche] = useState(0);
  const [plazo, setPlazo] = useState(0);
  const [solicitud, setSolicitud] = useState<'idle' | 'enviando' | 'enviada' | 'error'>('idle');

  useEffect(() => {
    let vivo = true;
    fetch(`${API_URL}/financiamiento/planes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Plan[]) => {
        if (!vivo) return;
        // Solo planes aplicables a este anuncio.
        const aplicables = data.filter(
          (p) => p.aplicaA === 'todos' || (p.aplicaA === 'verificados' && verificado),
        );
        setPlanes(aplicables);
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [verificado]);

  const plan = planes.find((p) => p.id === planId) ?? null;

  // Al elegir plan (o cargar el primero), fija enganche mínimo y plazo inicial.
  useEffect(() => {
    if (!plan && planes.length > 0) {
      setPlanId(planes[0].id);
      return;
    }
    if (plan) {
      setEnganche(redondear((precioNum * Number(plan.engancheMinPct)) / 100));
      setPlazo(plan.plazoMin);
    }
  }, [plan, planes, precioNum]);

  const engancheMin = plan ? redondear((precioNum * Number(plan.engancheMinPct)) / 100) : 0;
  const engancheMax = redondear(precioNum * 0.9);
  const engancheValido = Math.min(Math.max(enganche, engancheMin), engancheMax);

  const cuota = useMemo(() => {
    if (!plan) return null;
    return calcularCuotaNivelada({
      precio: precioNum,
      enganche: engancheValido,
      plazo,
      tasaAnual: Number(plan.tasaAnual),
    });
  }, [plan, precioNum, engancheValido, plazo]);

  async function solicitar() {
    if (!plan) return;
    setSolicitud('enviando');
    const res = await fetchAuth('/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiculoId, planId: plan.id, enganche: engancheValido, plazo }),
    });
    setSolicitud(res.ok ? 'enviada' : 'error');
  }

  if (planes.length === 0) return null;

  return (
    <section className="rounded-lg border border-borde bg-superficie p-4">
      <h2 className="font-display text-lg font-bold">{t('simulador.title')}</h2>
      <p className="mt-0.5 text-xs text-musgo">{t('simulador.disclaimer')}</p>

      <div className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-musgo">
            {t('simulador.entityPlan')}
          </span>
          <select
            value={planId ?? ''}
            onChange={(e) => setPlanId(Number(e.target.value))}
            className={estiloControl}
          >
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.entidad.nombre} — {p.nombre} ({p.tasaAnual}%)
              </option>
            ))}
          </select>
        </label>

        {plan && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-musgo">
                {t('simulador.downPayment', {
                  pct: plan.engancheMinPct,
                  monto: formatearPrecio(engancheMin, moneda),
                })}
              </span>
              <input
                type="number"
                min={engancheMin}
                max={engancheMax}
                step={1000}
                value={enganche}
                onChange={(e) => setEnganche(Number(e.target.value))}
                className={estiloControl}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-musgo">
                {t('simulador.term', { n: plazo })}
              </span>
              <select
                value={plazo}
                onChange={(e) => setPlazo(Number(e.target.value))}
                className={estiloControl}
              >
                {opcionesPlazo(plan.plazoMin, plan.plazoMax).map((p) => (
                  <option key={p} value={p}>
                    {t('simulador.months', { n: p })}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-md bg-lienzo p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-musgo">
                {t('simulador.monthlyEstimate')}
              </p>
              <p className="cifra text-3xl font-bold text-acento">
                {cuota !== null ? formatearPrecio(cuota, moneda) : '—'}
              </p>
              <p className="cifra mt-1 text-xs text-musgo">
                {t('simulador.summary', {
                  n: plazo,
                  tasa: plan.tasaAnual,
                  enganche: formatearPrecio(engancheValido, moneda),
                })}
              </p>
            </div>

            {solicitud === 'enviada' ? (
              <p className="text-center text-xs text-musgo">
                {t('simulador.requestSent')}{' '}
                <Link href="/solicitudes" className="font-medium text-acento hover:underline">
                  {t('simulador.viewMyRequests')}
                </Link>
              </p>
            ) : usuario ? (
              <button
                type="button"
                onClick={solicitar}
                disabled={solicitud === 'enviando'}
                className="rounded-md border border-acento px-4 py-2 text-sm font-medium text-acento hover:bg-lienzo disabled:opacity-60"
              >
                {solicitud === 'enviando'
                  ? t('simulador.sending')
                  : solicitud === 'error'
                    ? t('simulador.sendError')
                    : t('simulador.request')}
              </button>
            ) : (
              <Link
                href="/entrar?destino=/autos"
                className="rounded-md border border-acento px-4 py-2 text-center text-sm font-medium text-acento hover:bg-lienzo"
              >
                {t('simulador.loginToRequest')}
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}

const estiloControl =
  'w-full rounded-md border border-borde bg-papel placeholder:text-musgo px-2.5 py-1.5 text-sm focus:border-acento focus:outline-none';
