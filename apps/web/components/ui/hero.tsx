'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { renderCanvas } from '@/components/ui/canvas';
import { cn } from '@/lib/utils';

const IMAGEN_HERO_DEFECTO =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80';

/**
 * Hero del storefront: foto del vehículo de fondo + estelas neón que siguen el
 * cursor (canvas), con la tipografía y el acento cobalto de la marca. El acento
 * va en la segunda línea del titular (sin texto en degradado). `children` es el
 * slot para la búsqueda o los CTAs.
 */
function HeroCanvas({
  badge = 'Marketplace de vehículos usados · Guatemala',
  title1 = 'Tu próximo carro',
  title2 = 'te está esperando.',
  subtitle = 'Anuncios moderados, precios en quetzales o dólares y contacto directo con quien vende. Sin intermediarios, sin vueltas.',
  image = IMAGEN_HERO_DEFECTO,
  imageAlt = 'Un coupé deportivo bajo luz cálida, listo para salir a la carretera',
  priority = true,
  children,
  className,
}: {
  badge?: string;
  title1?: string;
  title2?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  priority?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;

  // Arranca el canvas al montar; la función de limpieza frena el loop y quita
  // los listeners al desmontar (evita loops duplicados en navegación SPA).
  useEffect(() => renderCanvas(), []);

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 1, delay: 0.4 + i * 0.15, ease: [0.25, 0.4, 0.25, 1] },
    }),
  };

  return (
    <section
      className={cn(
        'relative isolate flex min-h-[80vh] w-full items-center overflow-hidden bg-[#0a1016]',
        className,
      )}
    >
      {/* Vehículo de fondo (LCP de la home): la foto manda */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="100vw"
        className="-z-30 object-cover"
      />
      {/* Tinte cobalto en diagonal: denso donde va el texto (abajo-izquierda),
          translúcido arriba-derecha para que el auto se asome. Mantiene el
          contraste AA del titular blanco y deja glowear las estelas. */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-tr from-[#0a1016] via-[#0a1016]/85 to-[#0a1016]/45" />

      {/* Estelas neón que siguen el cursor (efecto). Sin pointer-events para no
          robar el hover del buscador ni de los enlaces. */}
      <canvas id="canvas" className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-28 md:px-6">
        <div className="max-w-3xl">
          <motion.p
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-5 flex items-center gap-2 text-sm font-medium text-white/80"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acento-vivo" />
            {badge}
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="titular text-[length:var(--text-hero)] text-white"
          >
            {title1} <span className="text-acento-vivo">{title2}</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="prosa mt-4 text-lg text-white/80"
          >
            {subtitle}
          </motion.p>

          {children ? (
            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mt-8"
            >
              {children}
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* Desvanecido inferior para cortar limpio con la franja de abajo */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#0a1016] to-transparent" />
    </section>
  );
}

export { HeroCanvas };
