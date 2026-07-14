import { cookies } from 'next/headers';
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from './config';
import { dictionaries } from './dictionaries';
import { createT, type Dict, type TFunction } from './t';

/** Lee el idioma de la cookie (server). Sin cookie → inglés por defecto. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

/** i18n para server components: `const { t } = await getI18n();`. */
export async function getI18n(): Promise<{ locale: Locale; dict: Dict; t: TFunction }> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return { locale, dict, t: createT(dict) };
}
