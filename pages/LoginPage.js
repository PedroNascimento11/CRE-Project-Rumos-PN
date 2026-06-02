export class LoginPage {

    constructor(page) {
        this.page = page;

        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#senha');
        this.loginButton = page.getByRole('button', { name: 'Entrar' });
        this.registerLink = page.getByRole('link', { name: 'Registre-se' });
    }

    async goto() {
        await this.page.goto('/login.html');
    }

    async login(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}