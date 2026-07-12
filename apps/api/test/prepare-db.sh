#!/usr/bin/env bash
# Prepara la BD de test: la crea si no existe, aplica migraciones y siembra el
# catálogo maestro. Idempotente — se puede correr antes de cada `pnpm test`.
set -euo pipefail

API_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="$(cd "$API_DIR/../.." && pwd)"
TEST_URL="postgresql://concesionario:concesionario@localhost:5433/concesionario_test?schema=public"

echo "▸ Preparando BD de test (concesionario_test)…"

# Crear la BD si no existe (vía el contenedor de Postgres del compose).
docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
  psql -U concesionario -d concesionario -tc \
  "SELECT 1 FROM pg_database WHERE datname='concesionario_test'" | grep -q 1 \
  || docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T postgres \
     psql -U concesionario -d concesionario -c "CREATE DATABASE concesionario_test" >/dev/null

cd "$API_DIR"
DATABASE_URL="$TEST_URL" pnpm exec prisma migrate deploy >/dev/null
DATABASE_URL="$TEST_URL" pnpm exec tsx prisma/seed.ts >/dev/null

echo "▸ BD de test lista."
