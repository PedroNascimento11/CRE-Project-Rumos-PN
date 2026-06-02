import { test, expect } from '@playwright/test';
import {
    generateUser,
    generateBook,
    generatePurchase
} from '../../../helpers/data/testData';
import { adminUser } from '../../../helpers/data/users';
import { LoginPage } from '../../../pages/LoginPage';
import { createUser } from '../../../helpers/api/users';
import { createBook } from '../../../helpers/api/books';

test.describe('Purchase Books UI', () => {

    test('CT-FE-018 - Registrar Compra (Aluno)', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        const user = generateUser();

        await createUser(
            request,
            user
        );

        const book = generateBook({
            estoque: 10
        });

        const createdBook =
            await createBook(
                request,
                book
            );

        // Handle login dialog specifically
        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.goto();

        await loginPage.login(
            user.email,
            user.senha
        );

        await expect(page).toHaveURL(
            /dashboard\.html/
        );

        await page.goto('/compras.html');

        const bookCard =
            page.locator('.book-card').filter({
                hasText: book.nome
            });

        await expect(
            bookCard
        ).toBeVisible();

        // Act
        const dialogMessages = [];

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await bookCard
            .getByRole('button', {
                name: 'Comprar'
            })
            .click();

        // Assert - Success alert
        await expect.poll(
            () => dialogMessages.length
        ).toBe(1);

        expect(
            dialogMessages[0]
        ).toContain(
            'Compra registrada com sucesso'
        );

        // Assert - Purchase appears in purchase history
        await page.goto(
            '/minhas-compras.html'
        );

        await expect(
            page.locator('#lista-compras')
        ).toContainText(
            `Livro ID: ${createdBook.id}`
        );

        await expect(
            page.locator('#lista-compras')
        ).toContainText(
            'Status: PENDENTE'
        );

    });

    test('CT-FE-019 - Aprovar Compra (Admin/Funcionário)', async ({ page, request }) => {

        // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(
            request,
            newUser
        );

        // Arrange - Create book
        const newBook = generateBook({
            estoque: 10
        });

        const createdBook = await createBook(
            request,
            newBook
        );

        // Arrange - Create purchase
        const purchasePayload = generatePurchase(
            createdUser.usuario.id,
            createdBook.id
        );

        const purchaseResponse =
            await request.post('/compras', {
                data: purchasePayload
            });

        const createdPurchase =
            await purchaseResponse.json();

        const purchaseId =
            createdPurchase.id;

        // Arrange - Login as admin
        const loginPage =
            new LoginPage(page);

        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.goto();

        await loginPage.login(
            adminUser.email,
            adminUser.senha
        );

        await expect(page)
            .toHaveURL(/dashboard\.html/);

        await page.goto(
            '/compras-admin.html'
        );

        const purchaseCard =
            page.locator('.book-card').filter({
                hasText: `Compra #${purchaseId}`
            });

        await expect(
            purchaseCard
        ).toBeVisible();

        // Act - Handle dialogs
        const dialogMessages = [];

        page.on('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await purchaseCard
            .locator('button.btn-primary')
            .click({
                force: true
            });

        // Assert - Confirm dialog
        await expect.poll(
            () => dialogMessages.length
        ).toBeGreaterThanOrEqual(2);

        expect(
            dialogMessages[0]
        ).toContain(
            `compra #${purchaseId}`
        );

        // Assert - Success dialog
        expect(
            dialogMessages[1]
        ).toContain(
            'Status atualizado com sucesso'
        );

        // Assert - Purchase status changed
        await expect.poll(async () => {

            const response =
                await request.get(
                    '/compras'
                );

            const purchases =
                await response.json();

            const purchase =
                purchases.find(
                    p => p.id === purchaseId
                );

            return purchase?.status;

        }).toBe('APROVADA');

        // Assert - Book stock reduced
        await page.goto('/livros.html');

        const bookCard =
            page.locator('.book-card').filter({
                hasText: newBook.nome
            });

        await expect(
            bookCard
        ).toContainText(
            'Estoque: 9'
        );

    });

});