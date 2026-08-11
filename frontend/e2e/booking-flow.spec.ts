import { test, expect } from '@playwright/test';

test.describe('Flujo completo de reserva y cancelación', () => {
    test('un paciente puede reservar una cita y luego cancelarla', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill('paciente@test.com');
        await page.getByLabel('Contraseña').fill('12345678');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page).toHaveURL(/.*\/appointments/);

        await page.getByText('Primera visita').click();

        const slotButton = page.getByRole('button', { name: /^\d{1,2}:\d{2}$/ }).first();
        await expect(slotButton).toBeVisible({ timeout: 10000 });
        await slotButton.click();

        await expect(page.getByRole('heading', { name: 'Confirmar reserva' })).toBeVisible();
        await page.getByRole('button', { name: 'Confirmar' }).click();
        await expect(page.getByRole('heading', { name: 'Confirmar reserva' })).not.toBeVisible();

        await page.getByRole('link', { name: 'Mis citas' }).click();
        await expect(page.getByText('Primera visita').first()).toBeVisible();

        await page.getByRole('button', { name: 'Cancelar cita' }).first().click();

        // El título del diálogo es un <h2>, distinto al botón que tiene el mismo texto
        await expect(page.getByRole('heading', { name: 'Cancelar cita' })).toBeVisible();
        await page.getByRole('button', { name: 'Cancelar cita' }).last().click();
        await expect(page.getByRole('heading', { name: 'Cancelar cita' })).not.toBeVisible();
    });
});