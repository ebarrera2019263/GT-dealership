import type { Locale } from './config';
import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import type { Dict } from './t';

export const dictionaries: Record<Locale, Dict> = { en, es };
