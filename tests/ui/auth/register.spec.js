import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../../pages/RegisterPage';
import { generateUser } from '../../../helpers/data/testData';

test.describe('Registration UI', () => {

    test('CT-FE-001 - Fluxo Completo de Registro (Aluno)', async ({ page }) => {

        // Arrange
        const registerPage = new RegisterPage(page);

        const user = generateUser();

        user.confirmarSenha = user.senha;

        await registerPage.goto();

        // Alert validation
        page.on('dialog', async dialog => {

            expect(dialog.message())
                .toContain('sucesso');

            await dialog.accept();
        });

        // Act
        await registerPage.register(
            user.nome,
            user.email,
            user.senha,
            user.confirmarSenha
        );

        // Assert - Redirect
        await expect(page)
            .toHaveURL(/login\.html/);

        // Assert - Form does not remain filled
        await expect(page.locator('#email'))
            .toHaveValue('');

        await expect(page.locator('#senha'))
            .toHaveValue('');

    });

    test('CT-FE-002 - Validação de Senhas Não Correspondentes', async ({ page }) => {

        // Arrange
        const registerPage = new RegisterPage(page);

        const user = generateUser();

        user.confirmarSenha = 'senha456';

        await registerPage.goto();

        // Alert validation
        page.on('dialog', async dialog => {

            expect(dialog.message())
                .toContain('As senhas não conferem.');

            await dialog.accept();
        });

        // Act
        await registerPage.register(
            user.nome,
            user.email,
            user.senha,
            user.confirmarSenha
        );

        // Assert - No Redirect
        await expect(page)
            .toHaveURL(/registro\.html/);

    });

});