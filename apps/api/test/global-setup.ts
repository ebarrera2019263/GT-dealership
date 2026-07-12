import { type ChildProcess, execSync, spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const TEST_URL =
  'postgresql://concesionario:concesionario@localhost:5433/concesionario_test?schema=public';
const PORT = 3099;

let server: ChildProcess | undefined;

// Vitest globalSetup: compila el API (nest build → tsc, que sí emite metadata de
// decoradores para la DI) y lo levanta contra la BD de test. Los specs lo pegan
// por HTTP en :3099.
export async function setup() {
  execSync('pnpm exec nest build', { cwd: process.cwd(), stdio: 'inherit' });

  server = spawn('node', ['dist/main'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: TEST_URL,
      PORT: String(PORT),
      NODE_ENV: 'test',
      THROTTLE_DISABLED: '1',
    },
    stdio: 'ignore',
  });

  const salud = `http://localhost:${PORT}/api/salud`;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(salud);
      if (r.ok) return;
    } catch {
      // todavía no levanta
    }
    await sleep(500);
  }
  throw new Error(`El API de test no respondió en ${salud} tras 30s`);
}

export async function teardown() {
  server?.kill('SIGTERM');
  await sleep(500);
  if (server && !server.killed) server.kill('SIGKILL');
}
