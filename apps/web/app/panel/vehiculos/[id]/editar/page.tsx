'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  FormularioVehiculo,
  type PayloadVehiculo,
  type ValoresVehiculo,
} from '../../../../../components/formulario-vehiculo';
import { type Imagen, UploaderFotos } from '../../../../../components/uploader-fotos';
import { useAuth } from '../../../../../lib/auth';
import { traccionLegible } from '../../../../../lib/formato';

const ESTADOS_EDITABLES = new Set(['borrador', 'rechazado', 'pausado']);

interface VehiculoEdicion {
  id: number;
  slug: string;
  estado: string;
  anio: number;
  version: string | null;
  precio: string;
  moneda: 'GTQ' | 'USD';
  precioNegociable: boolean;
  kilometraje: number;
  marcaId: number;
  modeloId: number;
  carroceriaId: number;
  transmisionId: number;
  combustibleId: number;
  cilindrada: string | null;
  potencia: number | null;
  puertas: number | null;
  color: string | null;
  traccion: string | null;
  numDuenos: number | null;
  descripcion: string | null;
  departamentoId: number;
  municipioId: number;
  caracteristicas: { caracteristicaId: number }[];
  imagenes: Imagen[];
}

function aValores(v: VehiculoEdicion): ValoresVehiculo {
  return {
    marcaId: v.marcaId,
    modeloId: v.modeloId,
    carroceriaId: v.carroceriaId,
    anio: v.anio,
    version: v.version,
    precio: Number(v.precio),
    moneda: v.moneda,
    precioNegociable: v.precioNegociable,
    kilometraje: v.kilometraje,
    transmisionId: v.transmisionId,
    combustibleId: v.combustibleId,
    cilindrada: v.cilindrada != null ? Number(v.cilindrada) : null,
    potencia: v.potencia,
    puertas: v.puertas,
    color: v.color,
    traccion: traccionLegible(v.traccion),
    numDuenos: v.numDuenos,
    descripcion: v.descripcion,
    departamentoId: v.departamentoId,
    municipioId: v.municipioId,
    caracteristicaIds: v.caracteristicas.map((c) => c.caracteristicaId),
  };
}

export default function EditarVehiculoPage() {
  const { usuario, cargando, fetchAuth } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [vehiculo, setVehiculo] = useState<VehiculoEdicion | null>(null);
  const [estadoCarga, setEstadoCarga] = useState<'cargando' | 'listo' | 'noEncontrado'>('cargando');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetchAuth(`/mi/vehiculos/${id}`);
    if (!res.ok) {
      setEstadoCarga('noEncontrado');
      return;
    }
    setVehiculo(await res.json());
    setEstadoCarga('listo');
  }, [fetchAuth, id]);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace(`/entrar?destino=/panel/vehiculos/${id}/editar`);
      return;
    }
    void cargar();
  }, [cargando, usuario, router, id, cargar]);

  async function guardar(payload: PayloadVehiculo) {
    setEnviando(true);
    setError('');
    setGuardado(false);
    const res = await fetchAuth(`/mi/vehiculos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const cuerpo = await res.json().catch(() => null);
    setEnviando(false);
    if (!res.ok) {
      setError(
        cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? 'No se pudieron guardar los cambios',
      );
      return;
    }
    setGuardado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (cargando || estadoCarga === 'cargando') {
    return <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-musgo">Cargando…</main>;
  }

  if (estadoCarga === 'noEncontrado' || !vehiculo) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-musgo">No se encontró el anuncio o no es tuyo.</p>
        <Link href="/panel" className="mt-3 inline-block font-medium text-quetzal hover:underline">
          Volver a mis anuncios
        </Link>
      </main>
    );
  }

  const editable = ESTADOS_EDITABLES.has(vehiculo.estado);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/panel" className="text-sm text-musgo hover:text-quetzal">
        ← Mis anuncios
      </Link>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Editar anuncio</h1>

      {guardado && (
        <p className="mt-4 rounded-md border border-quetzal bg-quetzal/10 px-3 py-2 text-sm text-quetzal">
          Cambios guardados.
        </p>
      )}

      {!editable ? (
        <div className="mt-6 rounded-lg border border-borde bg-white p-6">
          <p className="text-sm text-musgo">
            Este anuncio está <strong>{vehiculo.estado.replace('_', ' ')}</strong>. Para editarlo,
            primero pausalo desde{' '}
            <Link href="/panel" className="font-medium text-quetzal hover:underline">
              Mis anuncios
            </Link>
            . Solo se editan anuncios en borrador, rechazados o pausados.
          </p>
        </div>
      ) : (
        <>
          <FormularioVehiculo
            inicial={aValores(vehiculo)}
            textoSubmit="Guardar cambios"
            enviando={enviando}
            error={error}
            onSubmit={guardar}
          />
          <section className="mt-10 border-t border-borde pt-8">
            <h2 className="font-display text-xl font-bold tracking-tight">Fotos</h2>
            <p className="mt-1 text-sm text-musgo">
              Agregá, quitá o cambiá la foto principal. Los cambios se guardan al instante.
            </p>
            <div className="mt-4">
              <UploaderFotos vehiculoId={vehiculo.id} inicial={vehiculo.imagenes} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
