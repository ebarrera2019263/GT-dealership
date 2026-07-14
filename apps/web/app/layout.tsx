import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Link from 'next/link';
import { Navbar } from '../components/navbar';
import { AuthProvider } from '../lib/auth';
import { FavoritosProvider } from '../lib/favoritos';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/provider';
import { getI18n } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

// Cuerpo/UI: Inter (grotesca limpia, cifras tabulares para precios).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Display: Fraunces (serif de alto contraste con óptica variable — carácter de revista).
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['opsz'] });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: {
      default: t('meta.titleDefault'),
      template: '%s · Auto Dealers Guatemala',
    },
    description: t('meta.description'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict, t } = await getI18n();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(inter.variable, fraunces.variable, 'font-sans')}
    >
      <head>
        {/* Anti-parpadeo: aplica el tema (guardado o del sistema) antes del primer
            paint, para que no destelle claro→oscuro al cargar. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: script de tema, sin datos de usuario
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('tema');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-papel font-sans text-tinta antialiased">
        {/* Salto al contenido: invisible hasta recibir foco (teclado) — evita tabular
            por todo el navbar en cada página. */}
        <I18nProvider locale={locale} dict={dict}>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-acento focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-acento"
          >
            {t('common.skipToContent')}
          </a>
          <AuthProvider>
            <FavoritosProvider>
              <Navbar />
              <div id="contenido">{children}</div>
              <footer className="mt-16 border-t border-borde py-8 text-center text-sm text-musgo">
                <p>{t('footer.tagline')}</p>
                <p className="mt-2">
                  <Link href="/legal" className="hover:text-acento hover:underline">
                    {t('footer.legal')}
                  </Link>
                </p>
              </footer>
            </FavoritosProvider>
          </AuthProvider>
        </I18nProvider>
        {/* impeccable-live-start */}
        <script src="http://localhost:8400/live.js"></script>
        {/* impeccable-live-end */}
      </body>
    </html>
  );
}
