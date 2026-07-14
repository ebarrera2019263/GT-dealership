export type Dict = Record<string, unknown>;

/** Función de traducción: `t('home.title1')`, con interpolación `t('x', { n: 3 })`. */
export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Crea una función `t` sobre un diccionario. La clave es un path con puntos
 * (`home.trust.moderatedTitle`). Si no existe, devuelve la clave (fail-safe visible).
 * Soporta interpolación de `{variable}`.
 */
export function createT(dict: Dict): TFunction {
  return (key, vars) => {
    const value = key
      .split('.')
      .reduce<unknown>((acc, part) => (acc == null ? acc : (acc as Dict)[part]), dict);

    if (typeof value !== 'string') return key;
    if (!vars) return value;

    return value.replace(/\{(\w+)\}/g, (_, name: string) =>
      name in vars ? String(vars[name]) : `{${name}}`,
    );
  };
}
