'use client';

import { useRouter } from 'next/navigation';
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';
import { LOCALE_COOKIE, type Locale } from './config';
import { createT, type Dict, type TFunction } from './t';

interface I18nValue {
  locale: Locale;
  t: TFunction;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Provee el idioma + diccionario a los client components. Se monta en el layout
 * con el idioma y el diccionario resueltos en el server (a partir de la cookie).
 */
export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dict;
  children: ReactNode;
}) {
  const router = useRouter();
  const t = useMemo(() => createT(dict), [dict]);

  const setLocale = useCallback(
    (next: Locale) => {
      // biome-ignore lint/suspicious/noDocumentCookie: escribir la cookie de idioma desde el cliente es el mecanismo correcto acá
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      // Re-renderiza server components con el nuevo idioma sin recargar del todo.
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18nValue>(() => ({ locale, t, setLocale }), [locale, t, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n debe usarse dentro de <I18nProvider>');
  return ctx;
}

/** Atajo para traducir en client components: `const t = useT();`. */
export function useT(): TFunction {
  return useI18n().t;
}
