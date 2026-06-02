import { test, expect } from '@playwright/test';
import {
    generateUser
} from '../../../helpers/data/testData';
import { adminUser } from '../../../helpers/data/users';
import { LoginPage } from '../../../pages/LoginPage';
import { createUser } from '../../../helpers/api/users';

test.describe('Logout UI', () => {

    test('CT-FE-024 - Logout do Sistema', async ({ page, request }) => {

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
        await Promise.all([
            page.waitForURL(/login\.html/),
            page.getByRole('button', {
                name: 'Sair'
            }).click()
        ]);

        // Assert - Redirected to login
        await expect(page)
            .toHaveURL(/login\.html/);

        // Assert - localStorage cleared
        const storedUser =
            await page.evaluate(() =>
                localStorage.getItem('usuario')
            );

        expect(
            storedUser
        ).toBeNull();

        // Act - Try to access protected page
        await page.goto(
            '/dashboard.html'
        );

        // Assert - Redirected back to login
        await expect(page)
            .toHaveURL(/login\.html/);

    });

});