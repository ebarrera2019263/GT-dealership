export const locales = ['en', 'es'] as const;

export type Locale = (typeof locales)[number];

/** La página sale en inglés por defecto; el usuario puede cambiar a español. */
export const defaultLocale: Locale = 'en';

/** Cookie donde se recuerda el idioma elegido. */
export const LOCALE_COOKIE = 'locale';

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'en' || value === 'es';
}
