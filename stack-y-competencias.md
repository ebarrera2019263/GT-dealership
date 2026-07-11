# Stack técnico y competencias — Marketplace de vehículos usados

> Complemento del documento *Esquema del proyecto full stack*.
> Las estrellas de GitHub son **aproximadas** (órdenes de magnitud, no cifras exactas). El criterio real no es la popularidad: es que estén **mantenidas activamente** y que encajen con el dominio de clasificados.

---

## 1. Frontend

| Librería | ~Stars | Para qué en este proyecto |
|---|---|---|
| **Next.js** | ~130k | Base del sitio. App Router + Server Components: fichas y listados indexables por Google |
| **Tailwind CSS** | ~85k | Estilos sin salir del markup |
| **shadcn/ui** | ~90k | Componentes copy-paste (tablas, diálogos, formularios). Base del admin — es código tuyo, no una dependencia |
| **Radix UI** | ~16k | Primitivas accesibles debajo de shadcn (dropdowns, modales con foco correcto) |
| **TanStack Query** | ~45k | Caché y sincronización de datos del servidor |
| **TanStack Table** | ~26k | Tabla de vehículos del admin: paginación, orden, filtros, selección en lote |
| **React Hook Form** | ~43k | Formulario de publicación por pasos |
| **Zod** | ~40k | Validación tipada, compartida entre front y back |
| **Zustand** | ~52k | Estado global ligero (filtros del catálogo, favoritos) |
| **Recharts** | ~25k | Gráficos del dashboard admin |
| **Framer Motion** | ~25k | Transiciones del panel de detalle |
| **Embla Carousel** | ~7k | Galería de fotos del vehículo (ligero, táctil) |

> **shadcn/ui + TanStack Table** es la combinación que más rápido produce un admin de aspecto profesional. No busques un "template de admin".

---

## 2. Backend

| Librería | ~Stars | Para qué |
|---|---|---|
| **NestJS** | ~70k | Estructura por módulos, guards de rol, DTOs. Encaja con el esquema definido |
| **Prisma** | ~42k | ORM + migraciones + tipos generados desde el schema |
| **Drizzle ORM** | ~28k | Alternativa a Prisma: más liviano, SQL explícito. **Elegí uno, no los dos** |
| **BullMQ** | ~6k | Colas sobre Redis: correos, miniaturas, alertas de búsqueda, expirar anuncios |
| **Better Auth** | ~18k | Auth moderna: OTP por teléfono, roles, organizaciones |
| **Auth.js (NextAuth)** | ~27k | Alternativa si solo necesitás OAuth rápido |

### Si preferís PHP
**Laravel** (~80k) + **Filament** (~25k) genera un panel admin casi completo a partir de los modelos. Es el camino más rápido a un admin serio si venís de PHP.

---

## 3. Búsqueda, imágenes y pagos

| Herramienta | ~Stars | Nota |
|---|---|---|
| **Meilisearch** | ~50k | Búsqueda con filtros facetados, instantánea. **No en el MVP** |
| **Typesense** | ~23k | Alternativa muy similar a Meilisearch |
| **UploadThing** | ~7k | Subida de fotos con validación de tipo y tamaño, sin pelear con S3 |
| **sharp** | ~30k | Generar miniaturas y WebP en el worker |
| **Stripe** | — | Tarjetas internacionales, suscripciones |
| **Recurrente** | — | Pasarela local de Guatemala. Más práctica para cobrar en quetzales |

---

## 4. Calidad y operación

| Herramienta | ~Stars | Para qué |
|---|---|---|
| **Playwright** | ~72k | Tests E2E: publicar anuncio, filtrar, moderar |
| **Vitest** | ~14k | Tests unitarios |
| **Biome** | ~18k | Linter + formatter en uno. Reemplaza ESLint + Prettier |
| **Sentry** | ~40k | Errores en producción. No lo dejes para después |
| **Storybook** | ~86k | Catálogo de componentes. Útil si el equipo crece; opcional si trabajás solo |
| **Docker Compose** | — | Postgres + Redis + API en local, idénticos a producción |

---

## 5. Stack final recomendado

```
FRONTEND    Next.js · Tailwind · shadcn/ui · TanStack Query + Table · Zod
BACKEND     NestJS · Prisma · PostgreSQL · Redis + BullMQ · Better Auth
MEDIOS      UploadThing + sharp (miniaturas en worker)
BÚSQUEDA    Índices SQL en el MVP → Meilisearch en fase 2
CALIDAD     Biome · Vitest · Playwright · Sentry
INFRA       Docker Compose (local) · Vercel o Railway/Fly.io (producción)
```

### Dos advertencias que ahorran semanas

1. **No metas Meilisearch en el MVP.** Los índices de PostgreSQL aguantan de sobra los primeros miles de anuncios. Un motor de búsqueda temprano es infraestructura que mantenés sin necesitarla.

2. **Cuidado con los templates de "marketplace" de GitHub.** Los populares (GoCart, Singitronic, Next.js Commerce) son de **e-commerce clásico** — carrito, checkout, inventario. Tu dominio es **clasificados**: anuncios con moderación, leads, financiamiento. Adaptar uno cuesta más que construir sobre tu propio esquema.

---

# 6. Competencias necesarias por área

Lo que realmente hay que dominar para que este proyecto salga profesional. Ordenado por prioridad dentro de cada área.

## 6.1 SQL y base de datos
*Es donde más proyectos se caen. Priorizalo.*

| # | Competencia | Aplicado a este proyecto |
|---|---|---|
| 1 | **Modelado relacional y normalización (1FN–3FN)** | Separar `marcas`/`modelos` en vez de texto libre |
| 2 | **Índices**: B-tree, GIN, compuestos, parciales | Índice compuesto en `(estado, precio)`; GIN para búsqueda de texto |
| 3 | **`EXPLAIN ANALYZE`** | Diagnosticar por qué el listado con filtros tarda 800 ms |
| 4 | **JOINs y agregaciones** | KPIs del dashboard, conteos por marca |
| 5 | **Paginación por cursor** (no `OFFSET`) | El catálogo con miles de anuncios |
| 6 | **Transacciones y niveles de aislamiento** | Publicar anuncio + descontar cupo del plan: todo o nada |
| 7 | **Migraciones versionadas** | Nunca tocar la base a mano |
| 8 | **JSONB** | `criterios` de búsquedas guardadas, `datos_antes/despues` de auditoría |
| 9 | **Full-text search de PostgreSQL** (`tsvector`) | Buscar "hilux 4x4 diesel" sin Meilisearch |
| 10 | **Backups y restauración probada** | Un backup que nunca restauraste no es un backup |

**Cómo estudiarlo:** *Use The Index, Luke!* (gratis, sobre índices), la documentación oficial de PostgreSQL, y `pgexercises.com` para practicar.

## 6.2 Backend

| # | Competencia | Aplicado |
|---|---|---|
| 1 | **Diseño de API REST** (recursos, verbos, códigos de estado, paginación) | Los endpoints del esquema |
| 2 | **Autenticación y autorización** | JWT access/refresh + guard de rol **+ regla de propiedad** |
| 3 | **Validación en el servidor** | DTOs con Zod. La del formulario es cortesía, no seguridad |
| 4 | **Arquitectura en capas** (controller → service → repository) | Que la lógica de negocio no viva en el controller |
| 5 | **Trabajos en segundo plano** | Miniaturas, correos, alertas, expiración de anuncios |
| 6 | **Manejo de archivos** | Subida, validación, procesamiento, CDN |
| 7 | **Seguridad OWASP Top 10** | Inyección, IDOR, rate limiting, secretos fuera del repo |
| 8 | **Testing** | Unitario de servicios + integración de endpoints |
| 9 | **Observabilidad** | Logs estructurados, errores en Sentry, métricas |

## 6.3 Frontend

| # | Competencia | Aplicado |
|---|---|---|
| 1 | **React moderno**: hooks, composición, cuándo *no* usar estado | Todo |
| 2 | **Server vs Client Components** (Next.js App Router) | Listado en servidor (SEO), filtros en cliente |
| 3 | **Estado del servidor ≠ estado de UI** | TanStack Query para datos; Zustand solo para UI |
| 4 | **Formularios complejos** | Publicación por pasos, con guardado de borrador |
| 5 | **SEO técnico** | Metadatos por anuncio, `schema.org/Vehicle`, sitemap dinámico |
| 6 | **Core Web Vitals** | Imágenes optimizadas, lazy loading, LCP del listado |
| 7 | **Accesibilidad (WCAG AA)** | Foco visible, navegación por teclado, contraste |
| 8 | **Diseño responsive, mobile-first** | La mayoría del tráfico de este vertical es móvil |
| 9 | **Manejo de estados vacíos, carga y error** | Lo que separa un demo de un producto |

## 6.4 Arquitectura y oficio

| # | Competencia | Por qué importa acá |
|---|---|---|
| 1 | **Diseño guiado por el dominio (ligero)** | Nombrar bien: *anuncio*, *lead*, *moderación* — no *item* ni *post* |
| 2 | **Máquinas de estado** | El ciclo de vida del anuncio es el corazón del sistema |
| 3 | **Separación de responsabilidades** | Módulos con fronteras claras |
| 4 | **Caché** (qué, dónde y cómo invalidar) | Listados, catálogo maestro |
| 5 | **Colas y trabajo asíncrono** | Nada lento en el ciclo de la petición |
| 6 | **Git disciplinado** | Ramas, PRs, commits con sentido |
| 7 | **CI/CD** | Tests + despliegue automático |
| 8 | **Infraestructura como código / Docker** | Que el entorno local sea igual al de producción |
| 9 | **Documentación y ADRs** | Registrar *por qué* se tomó cada decisión |

---

## 7. Ruta de aprendizaje sugerida

| Orden | Foco | Señal de que ya lo tenés |
|---|---|---|
| 1 | **SQL y modelado** | Podés escribir el DER completo y justificar cada índice |
| 2 | **Backend: API + auth + capas** | Un vendedor no puede editar el anuncio de otro, y lo probaste |
| 3 | **Frontend: React + Next + formularios** | El listado renderiza en servidor y filtra en cliente sin recargar |
| 4 | **Arquitectura: colas, caché, estados** | Publicar un anuncio dispara 3 trabajos en segundo plano y la petición responde en 200 ms |
| 5 | **Operación: CI/CD, monitoreo, backups** | Desplegás sin miedo un viernes |

> Si tuvieras que elegir **una sola** cosa para dominar antes de escribir la primera línea: **el modelado de datos y los índices**. Un frontend feo se rediseña en una semana; un modelo de datos mal hecho se arrastra durante años.
