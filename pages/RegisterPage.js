export class RegisterPage {

    constructor(page) {
        this.page = page;

        this.nameInput = page.locator('#nome');
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#senha');
        this.confirmPasswordInput = page.locator('#confirmarSenha');

        this.registerButton = page.getByRole('button', {
            name: 'Registrar'
        });
    }

    async goto() {
        await this.page.goto('/registro.html');
    }

    async register(
        name,
        email,
        password,
        confirmPassword = password
    ) {
        await this.nameInput.fill(name);

        await this.emailInput.fill(email);

        await this.passwordInput.fill(password);

        await this.confirmPasswordInput.fill(confirmPassword);

        await this.registerButton.click();
    }
}