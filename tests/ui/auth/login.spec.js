import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';

test.describe('Authentication UI', () => {

    test('CT-FE-003 - Login com Sucesso (Admin)', async ({ page }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        await loginPage.goto();

        // Alert validation
        page.on('dialog', async dialog => {

            expect(dialog.message())
                .toContain('Login realizado com sucesso');

            await dialog.accept();
        });

        // Act
        await loginPage.login(
            'admin@biblioteca.com',
            '123456'
        );

        // Assert - Redirect to Dashboard
        await expect(page)
            .toHaveURL(/dashboard\.html/);

        // Assert - localStorage
        const usuario = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('usuario'));
        });

        expect(usuario).toBeTruthy();
        expect(usuario.tipo).toBe(3);

        // Assert - User name visible in header
        await expect(
            page.locator('.user-info')
        ).toContainText(usuario.nome);
    });

    test('CT-FE-004 - Login com Credenciais Inválidas', async ({ page }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        await loginPage.goto();

        // Alert validation
        page.on('dialog', async dialog => {

            expect(dialog.message())
                .toContain('Email ou senha incorretos');

            await dialog.accept();
        });

        // Act
        await loginPage.login(
            'admin@biblioteca.com',
            'senhaerrada'
        );

        // Assert - No Redirect to Dashboard
        await expect(page)
            .toHaveURL(/login\.html/);

        // Assert - localStorage
        const usuario = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('usuario'));
        });

    });

});