import { test, expect } from '@playwright/test';

test.describe('Reserva de citas', () => {
    test.beforeEach(async ({ page }) => {
        // Login como paciente antes de cada test de este bloque
        await page.goto('/login');
        await page.getByLabel('Email').fill('paciente@test.com');
        await page.getByLabel('Contraseña').fill('12345678');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page).toHaveURL(/.*\/appointments/);
    });

    test('muestra los tipos de sesión disponibles', async ({ page }) => {
        await expect(page.getByText('Primera visita')).toBeVisible();
    });

    test('al seleccionar un tipo de sesión aparece el selector de fecha', async ({ page }) => {
        await page.getByText('Primera visita').click();
        await expect(page.getByLabel('Buscar desde el')).toBeVisible();
    });

    test('permite navegar a "Mis citas"', async ({ page }) => {
        await page.getByRole('link', { name: 'Mis citas' }).click();
        await expect(page).toHaveURL(/.*\/my-appointments/);
        await expect(page.getByRole('heading', { name: 'Mis citas' })).toBeVisible();
    });
});