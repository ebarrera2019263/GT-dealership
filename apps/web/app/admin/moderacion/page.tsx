'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { formatearKm, formatearPrecio } from '../../../lib/formato';

interface Pendiente {
  id: number;
  slug: string;
  anio: number;
  version: string | null;
  precio: string;
  moneda: 'GTQ' | 'USD';
  kilometraje: number;
  color: string | null;
  descripcion: string | null;
  marca: { nombre: string };
  modelo: { nombre: string };
  usuario: { id: number; nombre: string; email: string; telefonoVerificado: boolean };
  imagenes: { id: number; url: string; urlThumb: string | null; esPrincipal: boolean }[];
}

export default function ModeracionPage() {
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const [pendientes, setPendientes] = useState<Pendiente[] | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [rechazando, setRechazando] = useState<number | null>(null);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const res = await fetchAuth('/admin/moderacion/pendientes');
    if (!res.ok) {
      setError('No se pudo cargar la cola de moderación');
      return;
    }
    setPendientes(await res.json());
  }, [fetchAuth]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace('/entrar?destino=/admin/moderacion');
      return;
    }
    if (usuario.rol !== 'admin') {
      router.replace('/');
      return;
    }
    void cargar();
  }, [cargando, usuario, router, cargar]);

  async function moderar(id: number, accion: 'aprobar' | 'rechazar') {
    setOcupado(id);
    setError('');
    const body = accion === 'rechazar' ? { accion, motivo } : { accion };
    const res = await fetchAuth(`/admin/vehiculos/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(
        cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? 'No se pudo completar la acción',
      );
    } else {
      setRechazando(null);
      setMotivo('');
      await cargar();
    }
    setOcupado(null);
  }

  if (cargando || !usuario || usuario.rol !== 'admin') {
    return <main className="mx-auto max-w-4xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Moderación</h1>
      <p className="mt-1 text-sm text-musgo">
        Anuncios esperando revisión. Aprobá para publicarlos o rechazá indicando el motivo.
      </p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {pendientes && pendientes.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-borde p-10 text-center text-musgo">
          No hay anuncios pendientes de revisión. 🎉
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-4">
        {pendientes?.map((v) => {
          const foto = v.imagenes.find((i) => i.esPrincipal) ?? v.imagenes[0];
          return (
            <li key={v.id} className="overflow-hidden rounded-lg border border-borde bg-white">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="h-40 w-full shrink-0 overflow-hidden rounded-md bg-papel sm:h-32 sm:w-48">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto.urlThumb ?? foto.url}
                      alt={`${v.marca.nombre} ${v.modelo.nombre}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-musgo">
                      sin foto
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {v.marca.nombre} {v.modelo.nombre} {v.anio}
                    {v.version ? ` · ${v.version}` : ''}
                  </p>
                  <p className="cifra text-sm text-musgo">
                    {formatearPrecio(v.precio, v.moneda)} · {formatearKm(v.kilometraje)}
                    {v.color ? ` · ${v.color}` : ''}
                  </p>
                  {v.descripcion && (
                    <p className="mt-2 line-clamp-2 text-sm text-musgo">{v.descripcion}</p>
                  )}
                  <p className="mt-2 text-xs text-musgo">
                    Vendedor: {v.usuario.nombre} ({v.usuario.email})
                    {v.usuario.telefonoVerificado ? ' · tel. verificado' : ''} · {v.imagenes.length}{' '}
                    foto{v.imagenes.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              {rechazando === v.id ? (
                <div className="flex flex-col gap-2 border-t border-borde bg-papel p-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-musgo">
                      Motivo del rechazo (mínimo 5 caracteres)
                    </span>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      rows={2}
                      placeholder="Ej. Las fotos no muestran el vehículo con claridad."
                      className="w-full rounded-md border border-borde bg-white px-3 py-2 text-sm focus:border-quetzal focus:outline-none"
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={ocupado === v.id || motivo.trim().length < 5}
                      onClick={() => moderar(v.id, 'rechazar')}
                      className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
                    >
                      Confirmar rechazo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRechazando(null);
                        setMotivo('');
                      }}
                      className="rounded-md border border-borde px-3 py-1.5 text-sm hover:border-quetzal hover:text-quetzal"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 border-t border-borde p-4">
                  <button
                    type="button"
                    disabled={ocupado === v.id}
                    onClick={() => moderar(v.id, 'aprobar')}
                    className="rounded-md bg-quetzal px-4 py-1.5 text-sm font-medium text-white hover:bg-quetzal-oscuro disabled:opacity-60"
                  >
                    {ocupado === v.id ? 'Aprobando…' : 'Aprobar y publicar'}
                  </button>
                  <button
                    type="button"
                    disabled={ocupado === v.id}
                    onClick={() => {
                      setRechazando(v.id);
                      setMotivo('');
                      setError('');
                    }}
                    className="rounded-md border border-borde px-4 py-1.5 text-sm hover:border-red-700 hover:text-red-700 disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
