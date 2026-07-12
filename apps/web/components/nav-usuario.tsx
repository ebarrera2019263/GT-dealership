'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

const PUEDE_VENDER = new Set(['vendedor', 'concesionario', 'admin']);

export function NavUsuario() {
  const { usuario, cargando, logout, fetchAuth } = useAuth();
  const router = useRouter();
  const [noLeidos, setNoLeidos] = useState(0);

  const cargarNoLeidos = useCallback(async () => {
    const res = await fetchAuth('/conversaciones/no-leidos');
    if (res.ok) {
      const { total } = await res.json();
      setNoLeidos(total);
    }
  }, [fetchAuth]);

  // Refresca el badge al montar y cada 30s mientras haya sesión.
  useEffect(() => {
    if (cargando || !usuario) return;
    void cargarNoLeidos();
    const t = setInterval(cargarNoLeidos, 30_000);
    return () => clearInterval(t);
  }, [cargando, usuario, cargarNoLeidos]);

  // Evita el parpadeo login→panel mientras se rehidrata la sesión
  if (cargando) {
    return <span className="h-8 w-20" />;
  }

  if (!usuario) {
    return (
      <>
        <Link href="/entrar" className="hover:text-quetzal">
          Entrar
        </Link>
        <Link
          href="/panel/publicar"
          className="rounded-md bg-quetzal px-3 py-1.5 font-medium text-white hover:bg-quetzal-oscuro"
        >
          Vender mi carro
        </Link>
      </>
    );
  }

  async function salir() {
    await logout();
    router.push('/');
  }

  return (
    <>
      {usuario.rol === 'admin' && (
        <Link href="/admin" className="hover:text-quetzal">
          Admin
        </Link>
      )}
      {PUEDE_VENDER.has(usuario.rol) && (
        <Link href="/panel" className="hover:text-quetzal">
          Mis anuncios
        </Link>
      )}
      <Link href="/favoritos" className="hover:text-quetzal">
        Favoritos
      </Link>
      <Link href="/busquedas" className="hover:text-quetzal">
        Búsquedas
      </Link>
      <Link href="/mensajes" className="relative hover:text-quetzal">
        Mensajes
        {noLeidos > 0 && (
          <span className="absolute -right-3 -top-2 rounded-full bg-quetzal px-1.5 text-xs font-semibold text-white">
            {noLeidos}
          </span>
        )}
      </Link>
      <button type="button" onClick={salir} className="text-musgo hover:text-quetzal">
        Salir
      </button>
    </>
  );
}
