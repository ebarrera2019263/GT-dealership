# Concesionario — Marketplace de vehículos usados

Marketplace de clasificados de vehículos usados para Guatemala. La arquitectura completa está en
[`esquema-marketplace-vehiculos.md`](./esquema-marketplace-vehiculos.md) y el stack en
[`stack-y-competencias.md`](./stack-y-competencias.md).

## Stack

- **Frontend**: Next.js (App Router) · Tailwind · shadcn/ui — `apps/web`
- **Backend**: NestJS · Prisma · PostgreSQL · Redis + BullMQ — `apps/api`
- **Compartido**: tipos y schemas Zod front↔back — `packages/shared`
- **Calidad**: Biome · Vitest · Playwright

## Decisiones de producto (checklist sección 10 del esquema)

| Decisión | Elección |
|---|---|
| Moneda | Multi-moneda GTQ/USD **con tipo de cambio** (tabla `tipos_cambio`, precio normalizado en GTQ para filtros) |
| Mensajería | Interna **desde el MVP** (conversaciones/mensajes en Fase 1) |
| Backend | NestJS |

## Desarrollo local

Requisitos: Node ≥ 22, pnpm (corepack), Docker.

```bash
docker compose up -d      # Postgres + Redis
pnpm install
pnpm db:migrate           # migraciones Prisma
pnpm db:seed              # catálogo maestro
pnpm dev                  # API (:3001) + web (:3000)
```

Variables de entorno: copiar `apps/api/.env.example` a `apps/api/.env`.
