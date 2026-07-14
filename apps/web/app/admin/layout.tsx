'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useT } from '@/lib/i18n/provider';
import { useAuth } from '../../lib/auth';

// Enlaces del panel admin. La etiqueta se traduce con `admin.nav.<key>`.
const NAV = [
  { href: '/admin', key: 'dashboard' },
  { href: '/admin/vehiculos', key: 'vehicles' },
  { href: '/admin/moderacion', key: 'moderation' },
  { href: '/admin/usuarios', key: 'users' },
  { href: '/admin/catalogo', key: 'catalog' },
  { href: '/admin/financiamiento', key: 'financing' },
  { href: '/admin/solicitudes', key: 'requests' },
  { href: '/admin/reportes', key: 'reports' },
  { href: '/admin/leads', key: 'leads' },
  { href: '/admin/auditoria', key: 'audit' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
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
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-musgo">{t('admin.loading')}</div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="md:w-52 md:shrink-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-musgo">
          {t('admin.section')}
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
                  activo ? 'bg-acento text-white' : 'text-tinta hover:bg-crema hover:text-acento'
                }`}
              >
                {t(`admin.nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
