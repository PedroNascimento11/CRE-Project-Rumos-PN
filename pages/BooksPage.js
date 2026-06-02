export class BooksPage {

    constructor(page) {
        this.page = page;

        this.bookNameInput = page.locator('#nome');
        this.authorInput = page.locator('#autor');
        this.pagesInput = page.locator('#paginas');
        this.descriptionInput = page.locator('#descricao');
        this.imageUrlInput = page.locator('#imagemUrl');
        this.stockInput = page.locator('#estoque');
        this.priceInput = page.locator('#preco');

        this.addBookButton = page.getByRole('button', {name: 'Adicionar Livro'});

        this.booksGrid = page.locator('#lista-livros');
    }

    async goto() {await this.page.goto('/livros.html');}

    async createBook(book) {

        await this.bookNameInput.fill(book.nome);

        await this.authorInput.fill(book.autor);

        await this.pagesInput.fill(book.paginas.toString());

        await this.descriptionInput.fill(book.descricao);

        await this.imageUrlInput.fill(book.imagemUrl);

        await this.stockInput.fill(book.estoque.toString());

        await this.priceInput.fill(book.preco.toString());

        await this.addBookButton.click();
    }
}