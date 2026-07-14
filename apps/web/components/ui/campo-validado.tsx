/**
 * Campo de formulario con etiqueta, ayuda opcional y error accesible.
 * El input hijo debe llevar `id={nombre}` (se lo da `useValidacion().campo`)
 * para que la etiqueta y el `aria-describedby` del error apunten bien.
 */
export function CampoValidado({
  etiqueta,
  nombre,
  error,
  ayuda,
  children,
}: {
  etiqueta: string;
  nombre: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={nombre} className="text-xs font-medium uppercase tracking-wide text-musgo">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${nombre}-error`} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : ayuda ? (
        <span className="text-xs text-musgo">{ayuda}</span>
      ) : null}
    </div>
  );
}

/** Estilo de control con feedback visual de invalidez (borde rojo vía aria-invalid). */
export const estiloControlValidado =
  'w-full rounded-md border border-borde bg-papel placeholder:text-musgo px-3 py-2 text-sm outline-none transition-colors focus:border-acento aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:border-red-600';
