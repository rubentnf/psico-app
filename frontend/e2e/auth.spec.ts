import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
    test('un usuario puede iniciar sesión con credenciales válidas', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel('Email').fill('paciente@test.com');
        await page.getByLabel('Contraseña').fill('12345678');
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Tras login exitoso, un paciente debe acabar en /appointments
        await expect(page).toHaveURL(/.*\/appointments/);
    });

    test('muestra un error con credenciales incorrectas', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel('Email').fill('paciente@test.com');
        await page.getByLabel('Contraseña').fill('contraseñaIncorrecta');
        await page.getByRole('button', { name: 'Entrar' }).click();

        await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible();
    });

    test('un admin es redirigido al panel de administración tras login', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel('Email').fill('psicologa@test.com');
        await page.getByLabel('Contraseña').fill('12345678');
        await page.getByRole('button', { name: 'Entrar' }).click();

        await expect(page).toHaveURL(/.*\/admin/);
    });

    test('el enlace a registro navega correctamente', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: 'Regístrate' }).click();
        await expect(page).toHaveURL(/.*\/register/);
    });
});