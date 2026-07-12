import { expect, test } from '@playwright/test';

// Un recorrido con cuenta que cubre los dos flujos de escritura críticos:
// agendar una visita desde la ficha y guardar una búsqueda. Registra un usuario
// nuevo (email único) contra el stack de dev.
test('registro → agendar visita → guardar búsqueda', async ({ page }) => {
  const email = `pw_${Date.now()}@test.gt`;

  // 1) Registro (la página crea rol vendedor y redirige al panel).
  await page.goto('/registro');
  await page.locator('input[name="nombre"]').fill('Playwright QA');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/panel\/publicar/);

  // 2) Agendar una visita a un anuncio ajeno desde su ficha.
  await page.goto('/autos');
  await page.locator('a[href^="/autos/"]').first().click();
  await expect(page.getByText('Agendar una visita')).toBeVisible();

  const cuando = new Date(Date.now() + 5 * 24 * 3600 * 1000);
  const valor = cuando.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  await page.locator('input[type="datetime-local"]').fill(valor);
  await page.getByRole('button', { name: 'Solicitar visita' }).click();
  await expect(page.getByText('Visita solicitada')).toBeVisible();

  // 3) Guardar una búsqueda desde el listado (ya con sesión).
  await page.goto('/autos');
  await page.getByRole('button', { name: 'Guardar esta búsqueda' }).click();
  await expect(page.getByText('Búsqueda guardada')).toBeVisible();
});
