import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { createUser } from '../../../helpers/api/users';
import {
    generateBook,
    generateUser
} from '../../../helpers/data/testData';
import { createBook } from '../../../helpers/api/books';
import { BookDetailsPage } from '../../../pages/BookDetailsPage';

test.describe('Favorites UI', () => {

    test('CT-FE-013 - Adicionar Livro aos Favoritos pela UI', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);
        const detailsPage = new BookDetailsPage(page);

        const user = generateUser();

        await createUser(
            request,
            user
        );

        const book = generateBook();

        const createdBook = await createBook(
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

        await expect(page)
            .toHaveURL(/dashboard\.html/);

        await detailsPage.goto(
            createdBook.id
        );

        // Act
        const dialogMessages = [];

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await detailsPage.addToFavorites();

        // Assert - Success alert
        await expect.poll(
            () => dialogMessages.length
        ).toBe(1);

        expect(
            dialogMessages[0].toLowerCase()
        ).toContain('favoritos');

        // Assert - Button changed
        await expect(
            detailsPage.removeFavoriteButton
        ).toBeVisible();

        // Assert - Book appears in favorites page
        await page.goto('/favoritos.html');

        await expect(
            page.locator('body')
        ).toContainText(
            book.nome
        );

    });

    test('CT-FE-014 - Remover Livro dos Favoritos', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);
        const detailsPage = new BookDetailsPage(page);

        const user = generateUser();
        await createUser(request, user);

        const book = generateBook();
        const createdBook = await createBook(
            request,
            book
        );

        await loginPage.goto();

        // Handle login dialog specifically
        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.login(
            user.email,
            user.senha
        );

        await expect(page).toHaveURL(/dashboard\.html/);

        await detailsPage.goto(
            createdBook.id
        );

        // Act - Add to Favorites
        const dialogMessages = [];

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await detailsPage.addToFavorites();

        await expect.poll(
            () => dialogMessages.length
        ).toBe(1);

        // Assert - Success alert
        expect(
            dialogMessages[0].toLowerCase()
        ).toContain('favoritos');

        // Act - Remove from Favorites
        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await detailsPage.removeFromFavorites();

        await expect.poll(
            () => dialogMessages.length
        ).toBe(2);

        // Assert - Remove alert
        expect(
            dialogMessages[1].toLowerCase()
        ).toContain('remov');

        // Assert - Button changed
        await expect(
            detailsPage.favoriteButton
        ).toBeVisible();

        // Assert - Book appears in favorites page
        await page.goto('/favoritos.html');

        await expect(
            page.locator('body')
        ).not.toContainText(book.nome);

    });

    test('CT-FE-015 - Listar Livros Favoritos', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);
        const detailsPage = new BookDetailsPage(page);

        const user = generateUser();
        await createUser(request, user);

        // Generate Book 1
        const book1 = generateBook();
        const createdBook1 = await createBook(
            request,
            book1
        );

        // Generate Book 2
        const book2 = generateBook();
        const createdBook2 = await createBook(
            request,
            book2
        );

        await loginPage.goto();

        // Handle login dialog specifically
        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.login(
            user.email,
            user.senha
        );

        await expect(page).toHaveURL(/dashboard\.html/);

        // Act - Add Book 1 to Favorites
        const dialogMessages = [];

        await detailsPage.goto(
            createdBook1.id
        );

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await detailsPage.addToFavorites();

        await expect.poll(
            () => dialogMessages.length
        ).toBe(1);

        // Assert - Success alert Message for Book 1
        expect(
            dialogMessages[0].toLowerCase()
        ).toContain('favoritos');

        await expect(
            detailsPage.removeFavoriteButton
        ).toBeVisible();

        // Act - Add Book 2 to Favorites
        await detailsPage.goto(
            createdBook2.id
        );

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await detailsPage.addToFavorites();

        await expect.poll(
            () => dialogMessages.length
        ).toBe(2);

        // Assert - Success alert Message for Book 2
        expect(
            dialogMessages[1].toLowerCase()
        ).toContain('favoritos');

        await expect(
            detailsPage.removeFavoriteButton
        ).toBeVisible();

        await expect(
            detailsPage.removeFavoriteButton
        ).toBeVisible();

        // Assert - Book appears in favorites page
        await page.goto('/favoritos.html');

        await expect(
            page.locator('body')
        ).toContainText(book1.nome);

        await expect(
            page.locator('body')
        ).toContainText(book2.nome);

    });

});