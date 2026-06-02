import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { createUser } from '../../../helpers/api/users';
import { generateUser } from '../../../helpers/data/testData';

test.describe('Navigation UI', () => {

    test('CT-FE-005 - Proteção de Rotas sem Login', async ({ page }) => {

        // Arrange
        await page.goto('/login.html');

        // Remove any existing session
        await page.evaluate(() => {
            localStorage.clear();
        });

        // Act
        await page.goto('/dashboard.html');

        // Assert
        await expect(page)
            .toHaveURL(/login\.html/);
    });

    test('CT-FE-006 - Menu Dinâmico - Aluno', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        const user = generateUser();

        await createUser(request, user);

        // Act
        await loginPage.goto();

        await loginPage.login(
            user.email,
            user.senha
        );

        // Assert - Menu items are visible
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

        await expect(page.getByRole('link', { name: 'Livros' })).toBeVisible();

        await expect(page.getByRole('link', { name: 'Favoritos' })).toBeVisible();

        await expect(page.getByRole('link', { name: 'Meus Arrendamentos' })).toBeVisible();

        await expect(page.locator('a[href="compras.html"]')).toBeVisible();

        await expect(page.locator('a[href="minhas-compras.html"]')).toBeVisible();


            // Assert - Dashboard
        await page.getByRole('link', {
            name: 'Dashboard'
        }).click();

        await expect(page)
            .toHaveURL(/dashboard\.html/);

            // Assert - Livros
        await page.getByRole('link', {
            name: 'Livros'
        }).click();

        await expect(page)
            .toHaveURL(/livros\.html/);

            // Assert - Favoritos
        await page.getByRole('link', {
            name: 'Favoritos'
        }).click();

        await expect(page)
            .toHaveURL(/favoritos\.html/);

            // Assert - Meus Arrendamentos
        await page.getByRole('link', {
            name: 'Meus Arrendamentos'
        }).click();

        await expect(page)
            .toHaveURL(/arrendamentos\.html/);

            // Assert - Compras
        await page.locator('a[href="compras.html"]').click();

        await expect(page)
            .toHaveURL(/compras\.html/);

            // Assert - Minhas Compras
        await page.getByRole('link', {
            name: 'Minhas Compras'
        }).click();

        await expect(page)
            .toHaveURL(/minhas-compras\.html/);

    });

    test('CT-FE-007 - Menu Dinâmico - Admin', async ({ page }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        // Act
        await loginPage.goto();

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.login(
            'admin@biblioteca.com',
            '123456'
        );

        
        // Assert
            // Assert - Standard menu items
        await expect(page.getByRole('link', {
            name: 'Dashboard'
        })).toBeVisible();

        await expect(page.getByRole('link', {
            name: 'Livros'
        })).toBeVisible();

        await expect(page.getByRole('link', {
            name: 'Favoritos'
        })).toBeVisible();

            // Assert - Admin-specific items
        await expect(page.getByRole('link', {
            name: 'Aprovações'
        })).toBeVisible();

        await expect(page.getByRole('link', {
            name: 'Compras Admin'
        })).toBeVisible();

        await expect(page.getByRole('link', {
            name: 'Usuários (Admin)'
        })).toBeVisible();

        // Second Act
        await page.getByRole('link', {
            name: 'Usuários (Admin)'
        }).click();

        // Final Assert
        await expect(page)
            .toHaveURL(/admin-usuarios\.html/);
    });

});