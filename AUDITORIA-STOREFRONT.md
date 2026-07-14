# Auditoría técnica — Storefront (home · /autos · ficha)

> Generada con `/impeccable audit` el **2026-07-12**. Estado del código: rama `main`.
> Este archivo es el punto de retomada: qué se encontró, qué falta arreglar y con qué comando.

## Cómo retomar

- Levantar todo: `docker compose up -d && pnpm dev` → web en :3000.
- Verificar visualmente con Playwright (home, `/autos`, ficha `/autos/[slug]`) en escritorio (1440) y móvil (390).
- Ir tachando la tabla de **Estado de arreglos** de abajo. Al terminar un bloque, volver a correr `/impeccable audit` para ver subir el puntaje.

## Puntaje de salud: **15/20 (Bueno)**

| # | Dimensión | Puntaje | Hallazgo clave |
|---|-----------|:---:|----------------|
| 1 | Accesibilidad | 3/4 | El buscador del hero anula el foco de teclado (`focus:outline-none` sin reemplazo) |
| 2 | Rendimiento | 2/4 | Imágenes sin optimizar; hero de 2000px carga eager sin `priority`/`srcset` |
| 3 | Responsive | 3/4 | Sólido en todo breakpoint; target táctil del corazón a 36px |
| 4 | Theming | 3/4 | Doble nombre para el mismo acento (`quetzal` en 39 archivos vs `acento` en 3) |
| 5 | Anti-patrones | 4/4 | Sin tells de AI: nada de gradient text, eyebrows por sección, ni hero-metric |

**Conteo:** 0 P0 · 2 P1 · 3 P2 · 2 P3.

**Nota:** el navbar "encimado" que aparece en capturas de página completa **NO es bug** — es un artefacto de cómo Playwright renderiza `sticky` en fullpage. En el viewport real se ve perfecto. No perseguir esto.

## Veredicto anti-patrones: PASA

No parece hecho por AI. Tipografía con intención (Fraunces serif + Inter grotesca), un solo acento cobalto usado con disciplina, la foto manda. Sin gradient text, sin eyebrows mayúsculas por sección, sin hero-metric, sin grids de cards idénticas, sin side-stripes.

---

## Hallazgos por severidad

### [P1] El buscador del hero anula el foco de teclado
- **Ubicación:** `apps/web/app/page.tsx:54` y `:71` (`<select name="marca">` e `<input name="precioMax">`)
- **Categoría:** Accesibilidad · WCAG 2.4.7 Focus Visible (AA)
- **Impacto:** ambos campos usan `focus:outline-none` sin anillo de reemplazo → quien navega con teclado no ve dónde está en el formulario de búsqueda principal. El resto del sitio sí usa `focus-visible` bien; esto es la excepción.
- **Fix:** cambiar `focus:outline-none` por `focus-visible:ring-2 focus-visible:ring-quetzal`, o mover un anillo al contenedor del `<form>` para foco unificado.
- **Comando:** `/impeccable harden`

### [P1] Imágenes sin optimizar — pesa donde más importa
- **Ubicación:** `page.tsx:24` (hero), `components/vehiculo-card.tsx:19`, `components/galeria-ficha.tsx` — todas `<img>` crudo con `eslint-disable no-img-element`
- **Categoría:** Rendimiento
- **Impacto:** el hero es un JPEG de 2000px cargado eager, sin `srcset` ni `priority` → es el LCP de la home y llega tarde/pesado, sobre todo en celular. Las cards usan `loading="lazy"` (bien) pero sirven imagen a tamaño completo sin `srcset`.
- **Fix:** migrar a `next/image` (da `srcset`, `sizes`, formatos modernos, `priority` para el hero) o al menos añadir `srcset`/`sizes` + `fetchpriority="high"` al hero. Los contenedores `aspect-[4/3]` ya evitan CLS → migración de bajo riesgo.
- **Comando:** `/impeccable optimize`

### [P2] Deuda de tokens: `quetzal` vs `acento`
- **Ubicación:** `quetzal*` en 39 archivos, `acento` en 3 (navbar). Mismo `#1a56db`.
- **Categoría:** Theming
- **Impacto:** el navbar se reescribió a `acento` y el resto quedó en el alias retro-compat `quetzal`. Funciona, pero es deuda: dos nombres para el mismo color y un `grep "acento"` no encuentra el 90% de los usos.
- **Fix:** canonizar `acento`, reemplazo mecánico `quetzal→acento`, dejar el alias solo en `globals.css`.
- **Comando:** `/impeccable extract`

### [P2] Contraste del acento azul en el titular del hero — verificar
- **Ubicación:** `page.tsx:37` — `te está esperando.` en `text-quetzal-vivo` (`#3b82f6`) sobre la foto
- **Categoría:** Accesibilidad · WCAG 1.4.3 (texto grande ≥3:1)
- **Impacto:** el degradado `to-tinta` oscurece bien y en capturas se leyó bien, pero `#3b82f6` sobre foto clara está en el filo del 3:1. Como la foto del hero puede cambiar, hay que garantizar el piso, no depender de la imagen actual.
- **Fix:** subir un poco la opacidad del degradado bajo el titular, o usar `--color-acento` (más oscuro) para el texto sobre foto.
- **Comando:** `/impeccable colorize`

### [P2] Target táctil del botón de favorito a 36px
- **Ubicación:** `components/boton-favorito.tsx:72` — `size-9` (36×36px) en la esquina de cada card
- **Categoría:** Responsive / Accesibilidad (WCAG 2.5.8 pasa el mínimo de 24px pero por debajo de los 44px recomendados)
- **Impacto:** en móvil, guardar favorito desde el grid es un toque chico pegado al borde de la foto; fácil de errar.
- **Fix:** subir a `size-11` (44px) o agrandar el área táctil con padding manteniendo el ícono `size-5`.
- **Comando:** `/impeccable adapt`

### [P3] Dark mode declarado pero no implementado
- **Ubicación:** `globals.css:4` (`@custom-variant dark`) + tokens `sidebar/chart` de shadcn sin valores `.dark`
- **Categoría:** Theming
- **Impacto:** config muerta. El storefront es claro a propósito (bien), pero el andamiaje sugiere intención a medias.
- **Fix:** implementar `.dark` de verdad, o quitar el `@custom-variant` y tokens no usados.
- **Comando:** `/impeccable distill`

### [P3] Falta enlace de salto al contenido
- **Ubicación:** `app/layout.tsx` (no hay "saltar al contenido")
- **Categoría:** Accesibilidad
- **Impacto:** con teclado hay que tabular por todo el navbar en cada página antes de llegar a resultados.
- **Fix:** `<a href="#main" class="sr-only focus:not-sr-only">` al inicio del `<body>`.
- **Comando:** `/impeccable harden`

## Patrones sistémicos

- **`<img>` crudo en todo el storefront** (5+ componentes) — revertir con `next/image` de una sola vez.
- **Alias de token a medio migrar** — cerrar `quetzal→acento` ahora o se repite en cada componente nuevo.

## Lo que está muy bien (mantener)

- Accesibilidad de detalle: `alt` descriptivos en español, `aria-label`/`aria-pressed`/`aria-current`, `<dialog>` nativo para el lightbox (focus-trap y Esc gratis).
- Movimiento con criterio: `prefers-reduced-motion` respetado, ease-out sin rebote, stagger sutil en el grid.
- Cifras tabulares en precios y specs — el precio se lee de un vistazo.
- CLS controlado por contenedores `aspect-[*]`.

---

## Acciones recomendadas (orden de ataque)

1. [P1] `/impeccable optimize` — imágenes con `srcset`/`priority` (hero + cards). Mayor retorno.
2. [P1] `/impeccable harden` — foco visible del buscador del hero + skip-link.
3. [P2] `/impeccable extract` — cerrar migración de tokens `quetzal→acento`.
4. [P2] `/impeccable colorize` — piso de contraste del azul sobre la foto del hero.
5. [P2] `/impeccable adapt` — target táctil del favorito a 44px.
6. [P3] `/impeccable polish` — pasada final (dark mode muerto, detalles).

## Estado de arreglos (ir tachando)

| Prioridad | Hallazgo | Archivo(s) | Estado |
|---|---|---|---|
| P1 | Foco del buscador del hero | `app/page.tsx` | ✅ Hecho (2026-07-12) |
| P1 | Imágenes sin optimizar | `next.config.ts`, `page.tsx`, `vehiculo-card.tsx`, `galeria-ficha.tsx`, `autos/page.tsx` | ✅ Hecho (2026-07-12) |
| P2 | Tokens `quetzal`→`acento` | 38 `.tsx` | ✅ Hecho (2026-07-12) |
| P2 | Contraste azul hero | `page.tsx` (scrim) | ✅ Hecho (2026-07-12) |
| P2 | Target táctil favorito | `boton-favorito.tsx` | ✅ Hecho (2026-07-12) |
| P3 | Dark mode muerto | `globals.css` (`color-scheme: light`) | ✅ Hecho (2026-07-12) |
| P3 | Skip-link | `app/layout.tsx` | ✅ Hecho (2026-07-12) |

## Arreglos aplicados — 2026-07-12 (los dos P1)

**Foco del buscador del hero (WCAG 2.4.7):**
- `app/page.tsx` — el `<select>` de marca y el `<input>` de precio cambiaron
  `focus:outline-none` (sin reemplazo) por `outline-none focus-visible:ring-2
  focus-visible:ring-quetzal focus-visible:ring-offset-2 focus-visible:ring-offset-superficie`,
  igual que el resto del sitio. Foco de teclado ahora visible.

**Imágenes optimizadas (migración a `next/image`):**
- `next.config.ts` — se agregó `images.remotePatterns`. El host del API se **deriva de
  `NEXT_PUBLIC_API_URL`** (no hardcodeado) para `/uploads/**`, más `images.unsplash.com`
  para el hero. Funciona en dev y prod.
- `app/page.tsx` — hero migrado a `<Image fill priority sizes="100vw">` (LCP priorizado,
  srcset automático). Queda detrás del degradado con `-z-20`.
- `components/vehiculo-card.tsx` — foto de card a `<Image fill sizes=...>`; nueva prop
  `prioridad` que marca `priority` solo en cards sobre el pliegue.
- `app/autos/page.tsx` — pasa `prioridad={i < 3}` (primera fila = LCP del listado).
  Resuelve el warning de LCP de Next.
- `components/galeria-ficha.tsx` — imagen principal, miniaturas, imagen del lightbox y
  riel del lightbox migrados a `next/image`. El lightbox usa `object-contain` (letterbox,
  no recorta la foto completa).

**Verificación:** `tsc --noEmit` limpio · Biome sin warnings · 0 errores/0 warnings de
consola en home, `/autos`, ficha y lightbox (probado en escritorio 1440 y móvil 390 con
Playwright). Capturas *después* en el scratchpad: `home-after.png`, `autos-after.png`,
`ficha-after.png`, `lightbox-after.png`.

**Nota operativa:** el cambio en `next.config.ts` requiere reiniciar el dev server de web
(`next.config` no hace hot-reload). Los cambios de componentes sí recargan solos.

## Arreglos aplicados — 2026-07-12 (los tres P2)

**Tokens `quetzal` → `acento` (deuda de theming):**
- Reemplazo mecánico y seguro `-quetzal` → `-acento` (solo clases con guión, ej.
  `text-quetzal`→`text-acento`, `bg-quetzal-oscuro`→`bg-acento-oscuro`) en **38 archivos
  `.tsx`** de `app/` y `components/`. Comando usado:
  `find app components -name "*.tsx" -exec perl -pi -e 's/-quetzal\b/-acento/g' {} +`
- **No se tocó** la palabra `quetzales` (la moneda, va precedida de espacio, no de guión):
  siguen 5 usos intactos. Verificado: 0 clases `-quetzal`, 144 `-acento`.
- Los alias `--color-quetzal*` siguen en `globals.css` como red de seguridad retro-compat,
  pero ya **no hay usos internos**. El color es idéntico (mismo cobalto `#1a56db`), así que
  el sitio se ve igual — es puramente deuda de nombres saldada.

**Contraste del acento azul en el hero (WCAG 1.4.3):**
- `app/page.tsx` — el scrim del hero pasó de `via-tinta/70` a `via-tinta/80`: más piso de
  contraste donde vive el titular, la foto sigue respirando arriba (`to-tinta/25`). Comentario
  agregado avisando que `HERO_IMG` debe seguir siendo una foto oscura.

**Target táctil del favorito:**
- `components/boton-favorito.tsx` — el corazón de la card pasó de `size-9` (36px) a `size-11`
  (44px), cumpliendo el mínimo recomendado de 44×44 sin cambiar el ícono (`size-5`).

**Verificación:** `tsc --noEmit` limpio · los 5 archivos tocados sin warnings de Biome · 0
errores de consola en home y `/autos` · color idéntico confirmado visualmente. Capturas:
`home-p2.png`, `autos-p2.png` en el scratchpad.

> Los 8 errores + 14 warnings que reporta `biome lint app components` son **preexistentes**
> (fuera del storefront: `<img>` en admin/panel/mensajes/navbar-logo/uploader, at-rules de
> Tailwind en `globals.css`, `useImportType` en `components/ui/*`, etc.). Ninguno lo
> introdujeron estos cambios; de hecho la migración a `next/image` quitó los `<img>` del
> storefront.

## Arreglos aplicados — 2026-07-12 (los dos P3)

**Dark mode muerto → declarar light-only:**
- `app/globals.css` — se agregó `color-scheme: light` al `html`. Los `dark:` que existen
  viven dentro de los componentes shadcn (`ui/button`, `ui/input`, `ui/select`) y vienen
  así de fábrica; arrancarlos sería pelear contra el framework. En su lugar la app ahora
  **declara explícito que es clara**, así los controles nativos (select, date, scrollbar)
  se ven claros aunque el SO esté en oscuro. Las variantes `dark:` quedan dormidas por
  diseño (no hay toggle ni clase `.dark`).

**Skip-link (a11y de teclado):**
- `app/layout.tsx` — enlace "Saltar al contenido" como primer hijo del `<body>`, invisible
  (`sr-only`) hasta recibir foco (`focus:not-sr-only`), apuntando a `#contenido`. Los
  `{children}` se envolvieron en `<div id="contenido">` como destino del salto. Evita
  tabular por todo el navbar en cada página.

**Verificación:** `tsc --noEmit` limpio · lint del layout sin warnings · el HTML sirve el
skip-link y `id="contenido"` · `color-scheme:light` presente en el CSS compilado · home,
`/autos` y ficha responden 200.

---

## Estado final

Los 7 hallazgos de la auditoría (2 P1 · 3 P2 · 2 P3) están resueltos. Correr
`/impeccable audit` de nuevo debería subir el puntaje (Accesibilidad, Rendimiento y
Theming eran las dimensiones débiles y fueron atacadas).

---

## Mejora extra — Validación reactiva de formularios (2026-07-12)

Los formularios eran "enviá y después te digo el error" (solo `required` de HTML + un
error genérico al final). Ahora validan **en vivo** contra los **schemas Zod compartidos**
(`packages/shared`, misma fuente de verdad que el server): error inline por campo al salir
(blur) y mientras corregís, con `aria-invalid` + `aria-describedby` (accesible).

**Nuevo:**
- `apps/web/lib/validacion.ts` — hook `useValidacion(schema, aValores)`. Tipa el schema de
  forma **estructural** (sin importar `zod`, que no es dependencia directa de la web).
- `apps/web/components/ui/campo-validado.tsx` — `<CampoValidado>` (label + error `role="alert"`)
  y `estiloControlValidado` (borde rojo vía `aria-[invalid=true]`).

**Aplicado a los formularios del embudo principal:**
- `components/formulario-lead.tsx` — contacto sin cuenta (todo comprador). Incluye la regla
  cruzada "teléfono o email" del schema.
- `app/entrar/page.tsx` — login.
- `app/registro/page.tsx` — alta de vendedor.

**También** (`packages/shared`, requiere `pnpm --filter @concesionario/shared build`):
mensajes en español para `loginSchema` (email/password) y `leadCrearSchema.nombre` que
salían en inglés genérico.

**Verificación:** `tsc` limpio · lint limpio · páginas 200 · lógica de validación probada
con script (mensajes correctos + regla cruzada del lead). Falta captura visual: el navegador
Playwright estaba desconectado.

**Pendiente natural (no hecho):** el **form de publicar vehículo** (`formulario-vehiculo.tsx`)
— es grande (selects encadenados) y merece su propia pasada, idealmente junto al **preview
de precio normalizado** ("≈ Q234,500 al cambio de hoy") y/o un **wizard con borrador**.
