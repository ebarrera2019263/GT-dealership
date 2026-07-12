import { expect, test } from '@playwright/test';

// Flujos públicos (sin cuenta): que lo esencial renderice y navegue.
test.describe('Público', () => {
  test('home → listado muestra tarjetas de vehículos', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Comprar' }).first().click();
    await expect(page).toHaveURL(/\/autos/);
    // Al menos una tarjeta enlaza a una ficha.
    await expect(page.locator('a[href^="/autos/"]').first()).toBeVisible();
  });

  test('la ficha muestra especificaciones y el bloque de visita', async ({ page }) => {
    await page.goto('/autos');
    await page.locator('a[href^="/autos/"]').first().click();
    await expect(page).toHaveURL(/\/autos\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Especificaciones')).toBeVisible();
    // AgendarVisita se pinta (logueado: formulario; sin sesión: invitación a entrar).
    await expect(page.getByText(/Agendar una visita|Entrar para agendar una visita/)).toBeVisible();
  });

  test('el aviso legal es accesible desde el footer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Aviso legal y términos de uso' }).click();
    await expect(page).toHaveURL(/\/legal/);
    await expect(
      page.getByRole('heading', { name: 'Aviso legal y términos de uso' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /La transacción es entre las partes/ }),
    ).toBeVisible();
  });
});
