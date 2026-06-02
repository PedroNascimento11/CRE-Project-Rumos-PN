import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { BooksPage } from '../../../pages/BooksPage';
import { generateBook } from '../../../helpers/data/testData';
import { createBook } from '../../../helpers/api/books';

test.describe('Books UI', () => {

    test('CT-FE-010 - Cadastro de Livro via UI', async ({ page }) => {

        // Arrange
        const loginPage = new LoginPage(page);
        const booksPage = new BooksPage(page);

        const book = generateBook();

        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.goto();

        await loginPage.login(
            'admin@biblioteca.com',
            '123456'
        );

        // Wait until login redirect is completely finished
        await expect(page)
            .toHaveURL(/dashboard\.html/);

        // Navigate only after dashboard is loaded
        await page.goto('/livros.html');

        // Verify page really loaded
        await expect(page)
            .toHaveURL(/livros\.html/);

        await expect(
            page.locator('#lista-livros')
        ).toBeVisible({
            timeout: 10000
        });

        // Act
        await booksPage.createBook(book);

        // Assert
        await expect(
            booksPage.booksGrid
        ).toContainText(book.nome);

        await expect(
            booksPage.booksGrid
        ).toContainText(book.autor);

    });

    test('CT-FE-011 - Validação de Campos Obrigatórios no Livro', async ({ page }) => {

        // Arrange
        const loginPage = new LoginPage(page);
        const booksPage = new BooksPage(page);

        await loginPage.goto();

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.login(
            'admin@biblioteca.com',
            '123456'
        );

        await expect(page)
            .toHaveURL(/dashboard\.html/);

        await booksPage.goto();

        // Act
        await booksPage.addBookButton.click();

        // Assert
        await expect(page)
            .toHaveURL(/livros\.html/);

        const nomeValidation =
            await booksPage.bookNameInput.evaluate(
                element => element.validationMessage
            );

        expect(nomeValidation).not.toBe('');
    });

    test('CT-FE-012 - Visualizar Detalhes de Livro', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);
        const booksPage = new BooksPage(page);

        const book = generateBook();

        const createdBook = await createBook(request,book);

        await loginPage.goto();

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.login(
            'admin@biblioteca.com',
            '123456'
        );

        await expect(page)
            .toHaveURL(/dashboard\.html/);

        await booksPage.goto();

        // Assert - Book exists in grid
        await expect(booksPage.booksGrid).toContainText(book.nome);

        // Act
        await page.getByText(book.nome).click();

        // Assert - Details page opened
        await expect(page)
            .toHaveURL(
                new RegExp(`detalhes\\.html\\?id=${createdBook.id}`)
            );

        // Assert - Book information displayed
        await expect(page.locator('body')).toContainText(book.nome);

        await expect(page.locator('body')).toContainText(book.autor);

        await expect(page.locator('body')).toContainText(book.paginas.toString());

        await expect(page.locator('body')).toContainText(book.descricao);
    });

});