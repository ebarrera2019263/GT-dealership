import { defineConfig } from 'vitest/config';

const TEST_DB =
  'postgresql://concesionario:concesionario@localhost:5433/concesionario_test?schema=public';

// Tests de integración: vitest levanta el API compilado (global-setup) contra
// una BD de test separada y los specs lo ejercitan por HTTP. PrismaClient (con
// DATABASE_URL de test) se usa solo para armar y limpiar datos.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['./test/global-setup.ts'],
    // Comparten una sola BD y un solo proceso de API: sin paralelismo entre archivos.
    fileParallelism: false,
    hookTimeout: 180_000,
    testTimeout: 30_000,
    env: {
      TEST_API_URL: 'http://localhost:3099/api',
      DATABASE_URL: TEST_DB,
    },
  },
});
