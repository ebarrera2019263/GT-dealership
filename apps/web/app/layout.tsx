import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NavUsuario } from '../components/nav-usuario';
import { AuthProvider } from '../lib/auth';
import { FavoritosProvider } from '../lib/favoritos';
import './globals.css';

// Cuerpo/UI: Inter (grotesca limpia, cifras tabulares para precios).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Display: Fraunces (serif de alto contraste con óptica variable — carácter de revista).
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['opsz'] });

export const metadata: Metadata = {
  title: {
    default: 'AutosGT — Vehículos usados en Guatemala',
    template: '%s · AutosGT',
  },
  description:
    'Comprá y vendé vehículos usados en Guatemala. Anuncios verificados, precios en quetzales y dólares, contacto directo con el vendedor.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn(inter.variable, fraunces.variable, 'font-sans')}>
      <body className="min-h-dvh bg-papel font-sans text-tinta antialiased">
        <AuthProvider>
          <FavoritosProvider>
            <header className="sticky top-0 z-40 border-b border-borde/70 bg-papel/80 backdrop-blur-md">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link
                  href="/"
                  className="font-display text-2xl font-extrabold tracking-tight text-tinta"
                >
                  Autos<span className="text-quetzal">GT</span>
                </Link>
                <nav className="flex items-center gap-5 text-sm">
                  <Link href="/autos" className="hover:text-quetzal">
                    Comprar
                  </Link>
                  <NavUsuario />
                </nav>
              </div>
            </header>
            {children}
            <footer className="mt-16 border-t border-borde py-8 text-center text-sm text-musgo">
              <p>AutosGT conecta compradores y vendedores; la transacción es entre las partes.</p>
              <p className="mt-2">
                <Link href="/legal" className="hover:text-quetzal hover:underline">
                  Aviso legal y términos de uso
                </Link>
              </p>
            </footer>
          </FavoritosProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
