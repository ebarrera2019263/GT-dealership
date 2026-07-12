import { defineConfig, devices } from '@playwright/test';

// Smoke tests de los flujos críticos del front. Corren contra el stack de dev
// ya levantado (web :3000 + API :3001). Son una capa aparte de los unit/integration
// (no entran en `pnpm test`); se corren con `pnpm --filter @concesionario/web test:e2e`.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: process.env.WEB_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
