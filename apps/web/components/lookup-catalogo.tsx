'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

interface Item {
  id: number;
  nombre: string;
  categoria?: string;
  _count: { vehiculos: number };
}

/**
 * ABM genérico para las tablas planas del catálogo (carrocerías, combustibles,
 * características). Borrado con guardia: el backend responde 409 si está en uso.
 */
export function LookupCatalogo({
  titulo,
  endpoint,
  conCategoria = false,
}: {
  titulo: string;
  endpoint: string;
  conCategoria?: boolean;
}) {
  const { fetchAuth } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState('');

  const base = `/admin/catalogo/${endpoint}`;

  const cargar = useCallback(async () => {
    const res = await fetchAuth(base);
    if (res.ok) setItems(await res.json());
  }, [fetchAuth, base]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function enviar(ruta: string, method: string, body?: object): Promise<boolean> {
    setError('');
    const res = await fetchAuth(ruta, {
      method,
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      setError(cuerpo?.message ?? 'La operación falló');
      return false;
    }
    return true;
  }

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || (conCategoria && !categoria.trim())) return;
    const body = conCategoria
      ? { nombre: nombre.trim(), categoria: categoria.trim() }
      : { nombre: nombre.trim() };
    if (await enviar(base, 'POST', body)) {
      setNombre('');
      setCategoria('');
      await cargar();
    }
  }

  async function renombrar(item: Item) {
    const nuevo = window.prompt(`Nuevo nombre de "${item.nombre}"`, item.nombre)?.trim();
    if (!nuevo || nuevo === item.nombre) return;
    if (await enviar(`${base}/${item.id}`, 'PATCH', { nombre: nuevo })) await cargar();
  }

  async function eliminar(item: Item) {
    if (!window.confirm(`¿Borrar "${item.nombre}"?`)) return;
    if (await enviar(`${base}/${item.id}`, 'DELETE')) await cargar();
  }

  return (
    <section className="rounded-lg border border-borde bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-musgo">{titulo}</h3>

      <form onSubmit={agregar} className="mt-2 flex flex-wrap gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="min-w-32 flex-1 rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none"
        />
        {conCategoria && (
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Categoría"
            className="min-w-28 flex-1 rounded-md border border-borde bg-white px-2.5 py-1.5 text-sm focus:border-quetzal focus:outline-none"
          />
        )}
        <button
          type="submit"
          className="rounded-md bg-quetzal px-3 py-1.5 text-sm font-medium text-white hover:bg-quetzal-oscuro"
        >
          Agregar
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      <ul className="mt-3 flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-md border border-borde px-3 py-1.5"
          >
            <span className="min-w-0 flex-1 truncate text-sm">
              {item.nombre}
              {item.categoria && (
                <span className="ml-1 text-xs text-musgo">· {item.categoria}</span>
              )}
              <span className="cifra ml-2 text-xs text-musgo">{item._count.vehiculos} anun</span>
            </span>
            <button
              type="button"
              onClick={() => renombrar(item)}
              className="text-xs text-musgo hover:text-quetzal"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => eliminar(item)}
              className="text-xs text-musgo hover:text-red-700"
            >
              Borrar
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-musgo">Sin registros.</li>}
      </ul>
    </section>
  );
}
