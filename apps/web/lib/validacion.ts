'use client';

import { useState } from 'react';

// Tipo estructural mínimo de un schema Zod: solo lo que usamos (safeParse).
// Evita depender del paquete `zod` en la web (vive en @concesionario/shared).
type ResultadoParse<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> } };
export type SchemaLike<T> = { safeParse(valor: unknown): ResultadoParse<T> };

/** Primer mensaje de error por campo de un ZodError (o {} si valida). */
export function erroresZod(schema: SchemaLike<unknown>, valores: unknown): Record<string, string> {
  const r = schema.safeParse(valores);
  if (r.success) return {};
  const errs: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const clave = String(issue.path[0] ?? '');
    if (clave && errs[clave] == null) errs[clave] = issue.message;
  }
  return errs;
}

type CambioEvento = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

/**
 * Validación reactiva contra un schema Zod compartido (fuente única de verdad
 * front↔back). Valida cada campo al salir (blur) y en vivo una vez tocado; al
 * enviar marca todo y valida completo. `aValores` mapea los campos crudos del
 * formulario (strings de los inputs) al shape que espera el schema.
 */
export function useValidacion<T>(
  schema: SchemaLike<T>,
  aValores: (campos: Record<string, string>) => unknown,
) {
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [enviado, setEnviado] = useState(false);

  function set(nombre: string, valor: string) {
    const next = { ...campos, [nombre]: valor };
    setCampos(next);
    // Solo re-validamos en vivo si el campo ya se tocó o ya se intentó enviar,
    // para no gritarle al usuario mientras todavía escribe por primera vez.
    if (tocado[nombre] || enviado) setErrores(erroresZod(schema, aValores(next)));
  }

  function blur(nombre: string) {
    setTocado((t) => ({ ...t, [nombre]: true }));
    setErrores(erroresZod(schema, aValores(campos)));
  }

  /** Valida todo; devuelve los datos parseados o null (y revela los errores). */
  function validar(): T | null {
    setEnviado(true);
    const r = schema.safeParse(aValores(campos));
    if (r.success) {
      setErrores({});
      return r.data;
    }
    setErrores(erroresZod(schema, aValores(campos)));
    return null;
  }

  const errorDe = (nombre: string) =>
    tocado[nombre] || enviado ? errores[nombre] : undefined;

  /** Props listas para un input/select/textarea controlado (incluye ARIA). */
  function campo(nombre: string) {
    const err = errorDe(nombre);
    return {
      id: nombre,
      name: nombre,
      value: campos[nombre] ?? '',
      onChange: (e: CambioEvento) => set(nombre, e.target.value),
      onBlur: () => blur(nombre),
      'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `${nombre}-error` : undefined,
    };
  }

  return { campos, set, campo, blur, validar, errorDe, enviado };
}
