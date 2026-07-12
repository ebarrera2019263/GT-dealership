'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../lib/auth';

// Claves de filtro que forman parte de una búsqueda guardada (§5.2). Excluye
// 'cursor', que es paginación, no criterio.
const CLAVES_CRITERIO = [
  'marca',
  'modelo',
  'carroceria',
  'anioMin',
  'anioMax',
  'precioMin',
  'precioMax',
  'kmMax',
  'transmisionId',
  'combustibleId',
  'departamentoId',
  'orden',
] as const;

export function GuardarBusqueda() {
  const { usuario, fetchAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [estado, setEstado] = useState<'idle' | 'guardando' | 'ok' | 'error'>('idle');

  async function guardar() {
    if (!usuario) {
      router.push('/entrar?destino=/autos');
      return;
    }
    const criterios: Record<string, string> = {};
    for (const clave of CLAVES_CRITERIO) {
      const valor = searchParams.get(clave);
      if (valor) criterios[clave] = valor;
    }

    setEstado('guardando');
    const res = await fetchAuth('/busquedas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criterios }),
    });
    setEstado(res.ok ? 'ok' : 'error');
  }

  if (estado === 'ok') {
    return (
      <p className="mt-3 rounded-md border border-borde bg-crema px-3 py-2 text-center text-xs text-musgo">
        Búsqueda guardada.{' '}
        <a href="/busquedas" className="font-medium text-quetzal hover:underline">
          Ver mis búsquedas
        </a>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={guardar}
      disabled={estado === 'guardando'}
      className="mt-3 w-full rounded-md border border-quetzal px-4 py-2 text-sm font-medium text-quetzal hover:bg-crema disabled:opacity-60"
    >
      {estado === 'guardando'
        ? 'Guardando…'
        : estado === 'error'
          ? 'No se pudo guardar — reintentar'
          : 'Guardar esta búsqueda'}
    </button>
  );
}
