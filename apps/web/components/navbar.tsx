'use client';

import { Menu, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/auth';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

const PUEDE_VENDER = new Set(['vendedor', 'concesionario', 'admin']);

type Enlace = { href: string; etiqueta: string; badge?: number };

function esActivo(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function EnlaceNav({
  href,
  etiqueta,
  badge,
  onNavegar,
  bloque = false,
}: Enlace & { onNavegar?: () => void; bloque?: boolean }) {
  const pathname = usePathname();
  const activo = esActivo(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavegar}
      aria-current={activo ? 'page' : undefined}
      className={cn(
        'rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento',
        bloque ? 'px-3 py-2.5' : 'px-3 py-1.5',
        // Estilo pastilla en escritorio (V2); en móvil se mantiene el bloque plano.
        activo
          ? bloque
            ? 'font-medium text-acento'
            : 'bg-acento/15 font-medium text-acento'
          : bloque
            ? 'text-tinta/75 hover:text-acento'
            : 'text-tinta/75 hover:bg-acento/10 hover:text-acento',
      )}
    >
      {etiqueta}
      {badge ? (
        <span className="cifra ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-acento px-1 text-[11px] font-semibold leading-4 text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Navbar() {
  const t = useT();
  const { usuario, cargando, logout, fetchAuth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);

  const cargarNoLeidos = useCallback(async () => {
    const res = await fetchAuth('/conversaciones/no-leidos');
    if (res.ok) {
      const { total } = await res.json();
      setNoLeidos(total);
    }
  }, [fetchAuth]);

  useEffect(() => {
    if (cargando || !usuario) return;
    void cargarNoLeidos();
    const t = setInterval(cargarNoLeidos, 30_000);
    return () => clearInterval(t);
  }, [cargando, usuario, cargarNoLeidos]);

  // Cerrar el menú móvil al cambiar de ruta
  useEffect(() => setAbierto(false), [pathname]);

  async function salir() {
    setAbierto(false);
    await logout();
    router.push('/');
  }

  // Enlaces según sesión
  const enlaces: Enlace[] = [{ href: '/autos', etiqueta: t('nav.buy') }];
  if (usuario) {
    if (PUEDE_VENDER.has(usuario.rol))
      enlaces.push({ href: '/panel', etiqueta: t('nav.myListings') });
    if (usuario.rol === 'admin') enlaces.push({ href: '/admin', etiqueta: t('nav.admin') });
    enlaces.push(
      { href: '/favoritos', etiqueta: t('nav.favorites') },
      { href: '/busquedas', etiqueta: t('nav.searches') },
      { href: '/citas', etiqueta: t('nav.visits') },
      { href: '/mensajes', etiqueta: t('nav.messages'), badge: noLeidos },
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-borde/70 bg-papel/80 backdrop-blur-md after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-acento/50 after:to-transparent">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Marca: emblema + wordmark */}
        <Link
          href="/"
          aria-label={t('nav.brandAria')}
          className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-emblema.png" alt="" className="h-9 w-auto" />
          <span className="hidden font-display text-lg font-bold leading-none tracking-tight text-tinta sm:block">
            Auto Dealers <span className="text-acento">Guatemala</span>
          </span>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <EnlaceNav key={e.href} {...e} />
          ))}
        </nav>

        {/* Acciones escritorio: toggle · clúster de auth (Entrar con borde + Vender relleno) */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {cargando ? (
            <span className="h-9 w-24" />
          ) : usuario ? (
            <button
              type="button"
              onClick={salir}
              className="rounded-md px-1 py-1.5 text-sm text-tinta/75 transition-colors hover:text-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <Link
              href="/entrar"
              className="inline-flex h-9 items-center rounded-lg border border-acento/50 px-4 text-sm font-medium text-tinta transition-colors hover:border-acento hover:bg-acento/10 hover:text-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
            >
              {t('nav.login')}
            </Link>
          )}
          <Button asChild size="sm">
            <Link href="/panel/publicar">
              <Plus className="size-4" />
              {t('nav.sellMyCar')}
            </Link>
          </Button>
        </div>

        {/* Acciones móvil: idioma + tema + menú */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-label={abierto ? t('nav.closeMenu') : t('nav.openMenu')}
            className="flex size-10 items-center justify-center rounded-md text-tinta transition-colors hover:bg-lienzo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
          >
            {abierto ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Panel móvil */}
      {abierto && (
        <div className="border-t border-borde/70 bg-papel md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-2 py-2">
            {enlaces.map((e) => (
              <EnlaceNav key={e.href} {...e} bloque onNavegar={() => setAbierto(false)} />
            ))}
            <div className="my-2 h-px bg-borde" />
            {cargando ? null : usuario ? (
              <button
                type="button"
                onClick={salir}
                className="rounded-md px-3 py-2.5 text-left text-sm text-tinta/75 transition-colors hover:text-acento"
              >
                {t('nav.logout')}
              </button>
            ) : (
              <EnlaceNav
                href="/entrar"
                etiqueta={t('nav.login')}
                bloque
                onNavegar={() => setAbierto(false)}
              />
            )}
            <Button asChild className="mt-2 w-full">
              <Link href="/panel/publicar" onClick={() => setAbierto(false)}>
                {t('nav.sellMyCar')}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
