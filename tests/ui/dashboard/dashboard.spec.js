import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { createUser } from '../../../helpers/api/users';
import { generateUser } from '../../../helpers/data/testData';

test.describe('Dashboard UI', () => {

     test('CT-FE-008 - Dashboard - Visão Admin', async ({ page }) => {

        // Arrange
        const loginPage = new LoginPage(page);


        await loginPage.goto();

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        // Act
        await loginPage.login(
            'admin@biblioteca.com',
            '123456'
        );

        // Assert - Load Dashboard page
        await expect(page)
            .toHaveURL(/dashboard\.html/)

        // Assert - Statistics cards exist
         await expect(page.locator('#stats'))
             .toContainText('Total de Livros');

         await expect(page.locator('#stats'))
             .toContainText('Total de Usuários');

         await expect(page.locator('#stats'))
             .toContainText('Livros Disponíveis');

         await expect(page.locator('#stats'))
             .toContainText('Alunos');

         await expect(page.locator('#stats'))
             .toContainText('Funcionários');

         await expect(page.locator('#stats'))
             .toContainText('Administradores');

         // Assert - Livros Disponíveis > 0
         const cardAvailableBooks = page.locator('.stat-card')
             .filter({
                 hasText: 'Livros Disponíveis'
             });

         const textAvailableBooks = await cardAvailableBooks.locator('.number').textContent();

         expect(Number(textAvailableBooks))
             .toBeGreaterThan(0);

         // Assert - Grid contains at most 5 books
         const amountBook = await page.locator('#livros-recentes .book-card').count();

         expect(amountBook).toBeLessThanOrEqual(5);
     });

     test('CT-FE-009 - Dashboard - Visão Aluno', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        const user = generateUser();

        await createUser(request, user);

        await loginPage.goto();

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        // Act
        await loginPage.login(
            user.email,
            user.senha
        );

        // Assert - Dashboard loaded
        await expect(page)
            .toHaveURL(/dashboard\.html/);

        // Assert - Student statistics cards
        await expect(page.locator('#stats'))
            .toContainText('Livros Disponíveis');

        await expect(page.locator('#stats'))
            .toContainText('Total de Livros');

        await expect(page.locator('#stats'))
            .toContainText('Alunos Cadastrados');

        // Assert - Statistics cards loaded
        expect(await page.locator('.stat-card').count()).toBe(3);

        // Assert - Recent books grid loaded
        const recentBooks = page.locator('#livros-recentes .book-card');

        expect(await recentBooks.count()).toBeGreaterThan(0);
     });

});