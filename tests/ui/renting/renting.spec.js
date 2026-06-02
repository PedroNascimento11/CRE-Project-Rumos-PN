import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { createUser } from '../../../helpers/api/users';
import { 
    generateBook,
    generateUser,
    generateBookRenting
} from '../../../helpers/data/testData';
import { createBook } from '../../../helpers/api/books';
import { createRenting } from '../../../helpers/api/createRenting';
import { adminUser } from '../../../helpers/data/users';
import { BookDetailsPage } from '../../../pages/BookDetailsPage';    
    
test.describe('Renting Books UI', () => {

    test('CT-FE-016 - Solicitar Novo Arrendamento', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        const user = generateUser();
        await createUser(request, user);

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

        await expect(page).toHaveURL(/dashboard\.html/);

        await page.goto('/arrendamentos.html');

        const today = new Date();

        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 7);

        const formattedStartDate =
            startDate.toISOString().split('T')[0];

        const formattedEndDate =
            endDate.toISOString().split('T')[0];

        // Act
        await page.locator('#livroSelect')
            .selectOption(
                createdBook.id.toString()
            );

        await page.locator('#dataInicio')
            .fill(formattedStartDate);

        await page.locator('#dataFim')
            .fill(formattedEndDate);

        // Capture dialog message instead of keeping dialog object
        const dialogMessages = [];

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await page.getByRole('button', {
            name: 'Solicitar Arrendamento'
        }).click();

        // Assert - Success alert
        await expect.poll(
            () => dialogMessages.length
        ).toBe(1);

        expect(
            dialogMessages[0]
        ).toContain(
            'Arrendamento solicitado com sucesso!'
        );

        // Assert - Arrendamento appears in list
        await expect(
            page.locator('#lista-arrendamentos')
        ).toContainText(
            createdBook.id.toString()
        );

        // Assert - Status is pending
        await expect(
            page.locator('#lista-arrendamentos')
        ).toContainText(
            'PENDENTE'
        );

    });

    test('CT-FE-017 - Aprovar Arrendamento', async ({ page, request }) => {

        // Arrange
        const loginPage = new LoginPage(page);

        const student = generateUser();

        const createdStudent = await createUser(
            request,
            student
        );

        const book = generateBook();

        const createdBook = await createBook(
            request,
            book
        );

        const rentingPayload =
            generateBookRenting(
                createdStudent.usuario.id,
                createdBook.id
            );

        const createdRenting =
            await createRenting(
                request,
                rentingPayload
            );

        // Handle login dialog specifically
        page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await loginPage.goto();

        await loginPage.login(
            adminUser.email,
            adminUser.senha
        );

        await expect(page).toHaveURL(
            /dashboard\.html/
        );

        await page.goto('/aprovacoes.html');

        const rentingCard =
            page.locator(
                '#lista-pendentes .book-card'
            ).filter({
                hasText:
                    `Arrendamento #${createdRenting.id}`
            });

        await expect(
            rentingCard
        ).toBeVisible();

        // Act - Confirmation dialog
        const dialogMessages = [];

        page.on('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await rentingCard
            .locator('button.btn-primary')
            .click();

        // Assert - Confirmation dialog
        await expect.poll(
            () => dialogMessages.length
        ).toBe(2);

        expect(
            dialogMessages[0]
                .toLowerCase()
        ).toContain(
            `arrendamento #${createdRenting.id}`
        );

        // Assert - Success alert
        expect(
            dialogMessages[1]
        ).toContain(
            'Arrendamento aprovado com sucesso!'
        );

        // Assert - Arrendamento removed from pending list
        await expect(
            page.locator('#lista-pendentes')
        ).not.toContainText(
            `Arrendamento #${createdRenting.id}`
        );

    });

});