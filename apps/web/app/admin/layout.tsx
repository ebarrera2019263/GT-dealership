'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../lib/auth';

// Enlaces del panel admin. Se irán activando módulo por módulo (Fase 3).
const NAV = [
  { href: '/admin', etiqueta: 'Dashboard' },
  { href: '/admin/vehiculos', etiqueta: 'Vehículos' },
  { href: '/admin/moderacion', etiqueta: 'Moderación' },
  { href: '/admin/usuarios', etiqueta: 'Usuarios' },
  { href: '/admin/catalogo', etiqueta: 'Catálogo' },
  { href: '/admin/reportes', etiqueta: 'Reportes' },
  { href: '/admin/leads', etiqueta: 'Leads' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Guard de rol centralizado para todo /admin/*: sin sesión → login;
  // con sesión no-admin → home.
  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace(`/entrar?destino=${encodeURIComponent(pathname)}`);
      return;
    }
    if (usuario.rol !== 'admin') {
      router.replace('/');
    }
  }, [cargando, usuario, pathname, router]);

  if (cargando || !usuario || usuario.rol !== 'admin') {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-musgo">Cargando…</div>;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="md:w-52 md:shrink-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-musgo">
          Administración
        </p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((item) => {
            const activo =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
                  activo ? 'bg-quetzal text-white' : 'text-tinta hover:bg-crema hover:text-quetzal'
                }`}
              >
                {item.etiqueta}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
