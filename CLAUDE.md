# Concesionario — Marketplace de vehículos usados (Guatemala)

## Primero: mirá el grafo del proyecto

Antes de explorar archivos a mano, **lee `graphify-out/GRAPH_REPORT.md`** — es el mapa
del proyecto (módulos, comunidades, nodos centrales). Para preguntas puntuales usá el
grafo en vez de grep:

```bash
graphify query "¿cómo funciona el refresh de tokens?"   # contexto amplio (BFS)
graphify path "AuthService" "PrismaService"             # camino entre dos conceptos
graphify explain "RolesGuard"                           # explicación de un nodo
```

El grafo vive en `graphify-out/graph.json` (visualización: `graphify-out/graph.html`).
Si cambiaste código de forma significativa, regeneralo incremental con `/graphify . --update`.

## Qué es este proyecto

Marketplace de clasificados de vehículos usados (NO e-commerce: anuncios con moderación,
leads y financiamiento — sin carrito ni checkout). La arquitectura completa está en
`esquema-marketplace-vehiculos.md` y el stack en `stack-y-competencias.md`. Leelos antes
de diseñar cualquier módulo nuevo.

## Estructura

- `apps/api` — NestJS + Prisma. Módulos: auth, usuarios, catalogo, admin, salud.
- `apps/web` — Next.js 15 App Router + Tailwind 4.
- `packages/shared` — schemas Zod y fórmula de cuota nivelada, compartidos front↔back.
  **Si validás algo en el API, el schema va acá**, no duplicado en cada lado.

## Decisiones de producto ya tomadas (no re-preguntar)

- **Multi-moneda GTQ/USD con tipo de cambio**: tabla `tipos_cambio` + columna
  `precio_gtq` normalizada; filtros y orden de precio SIEMPRE sobre `precio_gtq`.
- **Mensajería interna desde el MVP** (conversaciones/mensajes van en Fase 1, no en Fase 2).
- Backend NestJS (no Laravel). Roles: comprador | vendedor | concesionario | admin.

## Reglas del dominio

- Máquina de estados del anuncio (esquema §4): solo admin aprueba/rechaza; el vendedor
  pausa/reactiva/marca vendido. Toda transición se registra en `auditoria`.
- Autorización en dos niveles: `@Roles()` en el controller **+** regla de propiedad en el
  servicio (un vendedor solo toca SUS anuncios).
- VIN y placa nunca se exponen en la API pública.
- Validación con Zod en el servidor siempre; la del formulario es cortesía.

## Entorno local

- **Postgres del proyecto: puerto 5433** (el 5432 lo ocupa un Postgres nativo de esta
  máquina que pertenece a otro proyecto — no tocarlo).
- `docker compose up -d` → Postgres :5433 + Redis :6379.
- `pnpm dev` → API en :3001 (`/api`), web en :3000.
- `pnpm db:migrate` / `pnpm db:seed` — migraciones y catálogo maestro.
- Tras cambiar `packages/shared`: `pnpm --filter @concesionario/shared build`.
- Lint: `pnpm lint` (Biome; en `apps/api` la regla `useImportType` está apagada a
  propósito — convertir imports de servicios a `import type` rompe la DI de NestJS).

### Levantar / bajar todo

La BD y Redis van en Docker; API y web corren nativas con `pnpm`. El orden importa:
Docker primero (la API necesita la BD viva al arrancar), luego las apps.

```bash
# Levantar todo de un solo (infra + ambas apps en paralelo)
docker compose up -d && pnpm dev

# Bajar todo (sin borrar datos)
docker compose stop && pkill -f "pnpm.*dev"; pkill -f "next dev"; pkill -f "nest start"

# Reinicio total borrando la BD (⚠️ -v elimina los volúmenes)
docker compose down -v && docker compose up -d && pnpm db:migrate && pnpm db:seed && pnpm dev
```

- `pnpm dev:api` / `pnpm dev:web` para levantar una sola app.
- El script raíz `dev` usa `--filter "./apps/*"` **con comillas**: sin ellas, zsh
  expande el glob antes de pnpm y falla con `ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT`.
