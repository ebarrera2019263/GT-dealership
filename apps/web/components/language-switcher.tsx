'use client';

import { type Locale, locales } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils';

const LABELS: Record<Locale, string> = { en: 'EN', es: 'ES' };

/** Toggle EN/ES. Escribe la cookie de idioma y refresca los server components. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" es el patrón ARIA correcto para el toggle EN/ES
    <div
      role="group"
      aria-label={t('nav.language')}
      className={cn('inline-flex items-center rounded-lg border border-borde/70 p-0.5', className)}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento',
            locale === l ? 'bg-acento text-white' : 'text-tinta/70 hover:text-acento',
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
