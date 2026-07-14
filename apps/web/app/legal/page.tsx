import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t('legal.metaTitle'),
    description: t('legal.metaDescription'),
  };
}

export default async function LegalPage() {
  const { t } = await getI18n();
  // Cada sección: un título y sus párrafos. p2 solo existe en las secciones 1–5.
  const secciones = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    titulo: t(`legal.s${n}Title`),
    parrafos: [t(`legal.s${n}p1`), n <= 5 ? t(`legal.s${n}p2`) : null].filter(
      (x): x is string => x !== null,
    ),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">{t('legal.title')}</h1>
      <p className="mt-3 text-sm text-musgo">{t('legal.intro')}</p>

      <div className="mt-10 flex flex-col gap-8">
        {secciones.map((s) => (
          <section key={s.titulo}>
            <h2 className="font-display text-lg font-semibold text-tinta">{s.titulo}</h2>
            <div className="mt-2 flex flex-col gap-2">
              {s.parrafos.map((p) => (
                <p key={p.slice(0, 32)} className="leading-relaxed text-tinta/90">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-borde pt-6 text-xs text-musgo">{t('legal.footer')}</p>
    </main>
  );
}
