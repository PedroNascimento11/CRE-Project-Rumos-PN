import { test, expect } from '@playwright/test';
import {
    generateUser
} from '../../../helpers/data/testData';
import { adminUser } from '../../../helpers/data/users';
import { LoginPage } from '../../../pages/LoginPage';
import { createUser } from '../../../helpers/api/users';

test.describe('Admin Users UI', () => {

    test('CT-FE-020A - Acessar Tela de Usuários (Admin)', async ({ page }) => {

        // Arrange
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

        // Act
        await page
            .getByRole('link', {
                name: /Usuários \(Admin\)/i
            })
            .click();

        // Assert - Admin page loaded
        await expect(page)
            .toHaveURL(
                /admin-usuarios\.html/
            );

        // Assert - Admin content visible
        await expect(
            page.getByText('Usuários Cadastrados')
        ).toBeVisible();

        // Assert - User list visible
        await expect(
            page.locator(
                '#lista-usuarios'
            )
        ).toBeVisible();

    });

    test('CT-FE-020B - Bloquear Acesso de Não-Admin', async ({ page, request }) => {

        // Arrange
        const loginPage =
            new LoginPage(page);

        const user =
            generateUser();

        await createUser(
            request,
            user
        );

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

        // Act
        await page.goto(
            '/admin-usuarios.html'
        );

        // Assert - Block message visible
        await expect(
            page.locator(
                '#area-admin-bloqueio'
            )
        ).toContainText(
            'Somente administradores podem acessar esta página.'
        );

        // Assert - Admin content hidden
        await expect(
            page.locator(
                '#area-admin-conteudo'
            )
        ).toBeHidden();

    });

    test('CT-FE-021 - Criar Funcionário pela UI Admin', async ({ page }) => {

        // Arrange
        const loginPage =
            new LoginPage(page);

        const timestamp =
            Date.now();

        const employeeName =
            `Novo Func ${timestamp}`;

        const employeeEmail =
            `novo.func.${timestamp}@teste.com`;

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
            '/admin-usuarios.html'
        );

        // Act - Handle success dialog
        const dialogMessages = [];

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await page
            .locator('#nome')
            .fill(employeeName);

        await page
            .locator('#email')
            .fill(employeeEmail);

        await page
            .locator('#senha')
            .fill('123456');

        await page
            .locator('#tipo')
            .selectOption('2');

        await page
            .getByRole('button', {
                name: 'Criar Usuário'
            })
            .click();

        // Assert - Success alert
        await expect.poll(
            () => dialogMessages.length
        ).toBe(1);

        expect(
            dialogMessages[0]
        ).toContain(
            'Usuário criado com sucesso'
        );

        // Assert - User appears in table
        await expect(
            page.locator(
                `input[value="${employeeName}"]`
            )
        ).toBeVisible();

        await expect(
            page.locator(
                `input[value="${employeeEmail}"]`
            )
        ).toBeVisible();

    });

    test('CT-FE-022 - Editar Usuário na Tabela', async ({ page, request }) => {

        // Arrange - Create user
        const user =
            generateUser();

        const createdUser =
            await createUser(
                request,
                user
            );

        const userId =
            createdUser.usuario.id;

        const updatedName =
            `Usuario Editado ${Date.now()}`;

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
            '/admin-usuarios.html'
        );

        const nameInput =
            page.locator(
                `input[data-id="${userId}"][data-campo="nome"]`
            );

        await expect(
            nameInput
        ).toBeVisible();

        // Act - Handle success dialog
        const dialogMessages = [];

        page.once('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await nameInput.fill(
            updatedName
        );

        await page
            .locator(
                `button[onclick="salvarUsuario(${userId})"]`
            )
            .click();

        // Assert - Success alert
        await expect.poll(
            () => dialogMessages.length
        ).toBe(1);

        expect(
            dialogMessages[0]
        ).toContain(
            'Usuário atualizado com sucesso'
        );

        // Assert - Reload page
        await page.reload();

        // Assert - Updated name persisted
        await expect(
            page.locator(
                `input[data-id="${userId}"][data-campo="nome"]`
            )
        ).toHaveValue(
            updatedName
        );

    });

    test('CT-FE-023 - Excluir Usuário', async ({ page, request }) => {

        // Arrange - Create user
        const user =
            generateUser();

        const createdUser =
            await createUser(
                request,
                user
            );

        const userId =
            createdUser.usuario.id;

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
            '/admin-usuarios.html'
        );

        const userNameInput =
            page.locator(
                `input[data-id="${userId}"][data-campo="nome"]`
            );

        await expect(
            userNameInput
        ).toBeVisible();

        // Act - Handle dialogs
        const dialogMessages = [];

        page.on('dialog', async dialog => {

            dialogMessages.push(
                dialog.message()
            );

            await dialog.accept();
        });

        await page
            .locator(
                `button[onclick="excluirUsuario(${userId})"]`
            )
            .click();

        // Assert - Confirm dialog
        await expect.poll(
            () => dialogMessages.length
        ).toBeGreaterThanOrEqual(2);

        expect(
            dialogMessages[0]
        ).toContain(
            `usuário #${userId}`
        );

        // Assert - Success dialog
        expect(
            dialogMessages[1]
        ).toContain(
            'Usuário excluído com sucesso'
        );

        // Assert - User no longer appears in table
        await expect(
            page.locator(
                `input[data-id="${userId}"][data-campo="nome"]`
            )
        ).toHaveCount(0);

    });

});