'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/provider';

/**
 * Alterna claro/oscuro agregando la clase `.dark` en <html> y persistiendo la
 * elección en localStorage. El tema inicial (y el anti-parpadeo) lo resuelve un
 * script inline en el layout, antes del primer render.
 */
export function ThemeToggle() {
  const t = useT();
  const [oscuro, setOscuro] = useState(false);

  // Tras montar, sincronizamos el ícono con lo que el script inline ya aplicó.
  useEffect(() => {
    setOscuro(document.documentElement.classList.contains('dark'));
  }, []);

  function alternar() {
    const nuevo = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nuevo);
    try {
      localStorage.setItem('tema', nuevo ? 'dark' : 'light');
    } catch {}
    setOscuro(nuevo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? t('theme.toLight') : t('theme.toDark')}
      title={oscuro ? t('theme.light') : t('theme.dark')}
      className="flex size-9 items-center justify-center rounded-md text-tinta/75 transition-colors hover:bg-lienzo hover:text-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
    >
      {oscuro ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
