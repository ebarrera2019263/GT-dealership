'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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

// Etiqueta y color de cada estado (máquina de estados del esquema §4).
const ESTADO_UI: Record<string, { texto: string; clase: string }> = {
  borrador: { texto: 'Borrador', clase: 'bg-borde text-tinta' },
  en_revision: { texto: 'En revisión', clase: 'bg-ambar/20 text-ambar' },
  publicado: { texto: 'Publicado', clase: 'bg-quetzal/15 text-quetzal' },
  rechazado: { texto: 'Rechazado', clase: 'bg-red-100 text-red-700' },
  pausado: { texto: 'Pausado', clase: 'bg-borde text-musgo' },
  expirado: { texto: 'Expirado', clase: 'bg-borde text-musgo' },
  vendido: { texto: 'Vendido', clase: 'bg-tinta text-papel' },
};

// Estados en los que el vendedor puede editar el contenido del anuncio.
const EDITABLE = new Set(['borrador', 'rechazado', 'pausado']);

// Acciones disponibles según el estado actual (endpoint = acción).
const ACCIONES: Record<string, { accion: string; texto: string; primaria?: boolean }[]> = {
  borrador: [{ accion: 'publicar', texto: 'Enviar a revisión', primaria: true }],
  rechazado: [{ accion: 'publicar', texto: 'Reenviar a revisión', primaria: true }],
  expirado: [{ accion: 'publicar', texto: 'Reenviar a revisión', primaria: true }],
  publicado: [
    { accion: 'pausar', texto: 'Pausar' },
    { accion: 'vendido', texto: 'Marcar vendido' },
  ],
  pausado: [
    { accion: 'reactivar', texto: 'Reactivar', primaria: true },
    { accion: 'vendido', texto: 'Marcar vendido' },
  ],
};

export default function PanelPage() {
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<VehiculoPanel[] | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/mi/vehiculos');
    if (!res.ok) {
      setError('No se pudieron cargar tus anuncios');
      return;
    }
    setVehiculos(await res.json());
  }, [fetchAuth]);

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
      setError(
        cuerpo?.message ?? cuerpo?.errores?.[0]?.detalle ?? 'No se pudo completar la acción',
      );
    } else {
      await cargar();
    }
    setOcupado(null);
  }

  if (cargando || (!usuario && !error)) {
    return <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">Mis anuncios</h1>
        <Link
          href="/panel/publicar"
          className="rounded-md bg-quetzal px-3 py-2 text-sm font-medium text-white hover:bg-quetzal-oscuro"
        >
          Publicar vehículo
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
              ['Anuncios', vehiculos.length],
              ['Publicados', publicados],
              ['Vistas', totalVistas],
              ['Contactos', totalContactos],
            ];
            return metricas.map(([label, valor]) => (
              <div key={label} className="rounded-lg border border-borde bg-white p-3">
                <p className="cifra text-2xl font-bold">{valor.toLocaleString('es-GT')}</p>
                <p className="text-xs uppercase tracking-wide text-musgo">{label}</p>
              </div>
            ));
          })()}
        </div>
      )}

      {vehiculos && vehiculos.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center">
          <p className="text-musgo">Todavía no publicaste ningún vehículo.</p>
          <Link
            href="/panel/publicar"
            className="mt-3 inline-block font-medium text-quetzal hover:underline"
          >
            Publicá el primero
          </Link>
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {vehiculos?.map((v) => {
          const ui = ESTADO_UI[v.estado] ?? { texto: v.estado, clase: 'bg-borde text-tinta' };
          const acciones = ACCIONES[v.estado] ?? [];
          const thumb = v.imagenes[0]?.urlThumb ?? v.imagenes[0]?.url;
          return (
            <li
              key={v.id}
              className="flex flex-col gap-3 rounded-lg border border-borde bg-white p-3 sm:flex-row sm:items-center"
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
                      sin foto
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
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${ui.clase}`}
                    >
                      {ui.texto}
                    </span>
                    <span className="cifra text-xs text-musgo">
                      {v.vistas.toLocaleString('es-GT')} vistas · {v.contactos} contactos
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {v.estado === 'publicado' && (
                  <Link
                    href={`/autos/${v.slug}`}
                    className="rounded-md border border-borde px-3 py-1.5 text-sm hover:border-quetzal hover:text-quetzal"
                  >
                    Ver
                  </Link>
                )}
                {EDITABLE.has(v.estado) && (
                  <Link
                    href={`/panel/vehiculos/${v.id}/editar`}
                    className="rounded-md border border-borde px-3 py-1.5 text-sm hover:border-quetzal hover:text-quetzal"
                  >
                    Editar
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
                        ? 'rounded-md bg-quetzal px-3 py-1.5 text-sm font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60'
                        : 'rounded-md border border-borde px-3 py-1.5 text-sm hover:border-quetzal hover:text-quetzal disabled:opacity-60'
                    }
                  >
                    {a.texto}
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
