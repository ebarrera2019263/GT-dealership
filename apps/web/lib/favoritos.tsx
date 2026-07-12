'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth';

interface FavoritosContexto {
  ids: Set<number>;
  listo: boolean;
  esFavorito: (vehiculoId: number) => boolean;
  alternar: (vehiculoId: number) => Promise<void>;
}

const Contexto = createContext<FavoritosContexto | null>(null);

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const { usuario, cargando, fetchAuth } = useAuth();
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      setIds(new Set());
      setListo(true);
      return;
    }
    fetchAuth('/favoritos/ids')
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d) => setIds(new Set<number>(d.ids)))
      .catch(() => setIds(new Set()))
      .finally(() => setListo(true));
  }, [usuario, cargando, fetchAuth]);

  const alternar = useCallback(
    async (vehiculoId: number) => {
      const activo = ids.has(vehiculoId);
      // Optimista: actualizamos ya y revertimos si falla.
      setIds((prev) => {
        const copia = new Set(prev);
        if (activo) copia.delete(vehiculoId);
        else copia.add(vehiculoId);
        return copia;
      });
      const res = activo
        ? await fetchAuth(`/favoritos/${vehiculoId}`, { method: 'DELETE' })
        : await fetchAuth('/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehiculoId }),
          });
      if (!res.ok) {
        setIds((prev) => {
          const copia = new Set(prev);
          if (activo) copia.add(vehiculoId);
          else copia.delete(vehiculoId);
          return copia;
        });
      }
    },
    [ids, fetchAuth],
  );

  const valor = useMemo<FavoritosContexto>(
    () => ({ ids, listo, esFavorito: (id) => ids.has(id), alternar }),
    [ids, listo, alternar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFavoritos(): FavoritosContexto {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error('useFavoritos debe usarse dentro de <FavoritosProvider>');
  }
  return ctx;
}
