'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

const PUEDE_VENDER = new Set(['vendedor', 'concesionario', 'admin']);

export function NavUsuario() {
  const { usuario, cargando, logout } = useAuth();
  const router = useRouter();

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
        <Link href="/admin/moderacion" className="hover:text-quetzal">
          Moderación
        </Link>
      )}
      {PUEDE_VENDER.has(usuario.rol) && (
        <Link href="/panel" className="hover:text-quetzal">
          Mis anuncios
        </Link>
      )}
      <button type="button" onClick={salir} className="text-musgo hover:text-quetzal">
        Salir
      </button>
    </>
  );
}
