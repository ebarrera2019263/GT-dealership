import type { Metadata } from 'next';
import { Archivo, Archivo_Narrow } from 'next/font/google';
import Link from 'next/link';
import { NavUsuario } from '../components/nav-usuario';
import { AuthProvider } from '../lib/auth';
import './globals.css';

const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo' });
const archivoNarrow = Archivo_Narrow({ subsets: ['latin'], variable: '--font-archivo-narrow' });

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
    <html lang="es" className={`${archivo.variable} ${archivoNarrow.variable}`}>
      <body className="min-h-dvh bg-papel font-sans text-tinta antialiased">
        <AuthProvider>
          <header className="border-b border-borde bg-papel">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-display text-2xl font-bold tracking-tight">
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
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
