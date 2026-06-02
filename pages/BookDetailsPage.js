export class BookDetailsPage {

    constructor(page) {
        this.page = page;

        this.favoriteButton = page.getByRole('button', {
            name: /Favoritos/i
        });

        this.removeFavoriteButton = page.getByRole('button', {
            name: /Remover/i
        });


        this.deleteButton = page.getByRole('button', {
            name: /Deletar Livro/i
        });

        this.backButton = page.getByRole('button', {
            name: /Voltar/i
        });
    }

    async goto(bookId) {
        await this.page.goto(
            `/detalhes.html?id=${bookId}`
        );
    }

    async addToFavorites() {
        await this.favoriteButton.click();
    }

    async removeFromFavorites() {
        await this.removeFavoriteButton.click();
    }
}