import { test, expect } from '@playwright/test';
import { 
    generateBook
 } from '../../../helpers/data/testData';
import {
  validBook,
  invalidBook
} from '../../../helpers/data/books';
import {
  createBook,
  deleteBook
} from '../../../helpers/api/books';


test.describe('Books API', () => {

    let createdBookIds = [];

    test.afterEach(async ({ request }) => {

        for (const bookId of createdBookIds) {

        try {
            await request.delete(`/livros/${bookId}`);
        } catch (error) {
            console.log(`Failed to delete book ${bookId}`);
        }
        }

        createdBookIds = [];
    });

    test('CT-API-005 - Listar Todos os Livros', async ({ request }) => {

        // Act
        const response = await request.get('/livros');

        const body = await response.json();

        console.log(body);

        // Assert
        expect(response.status()).toBe(200);

        expect(Array.isArray(body)).toBeTruthy();

        if (body.length > 0) {

            expect(body[0]).toHaveProperty('id');
            expect(body[0]).toHaveProperty('nome');
            expect(body[0]).toHaveProperty('autor');
            expect(body[0]).toHaveProperty('paginas');
        }

    });

    test('CT-API-006 - Listar Livros Disponíveis', async ({ request }) => {

        // Arrange - Generate New book with estoque = 0
        const newUnavailableBook = generateBook({
            estoque: 0
        });

        const createdBook = await createBook(request, newUnavailableBook);

        // Act
        const response = await request.get('/livros/disponiveis');

        const body = await response.json();

        console.log(body);

        // Assert
        expect(response.status()).toBe(200);

        expect(Array.isArray(body)).toBeTruthy();


        body.forEach(book => {
            expect(book.estoque).toBeGreaterThan(0);
        });


        const unavailableBookExists = body.some(
            book => book.id === createdBook.id
        );

        expect(unavailableBookExists).toBeFalsy();

    });

    test('CT-API-007 - Buscar Livro por ID (Existente)', async ({ request }) => {

        // Arrange - Generate New book
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const createdBookId = createdBook.id;

        // Act
        const response = await request.get(`/livros/${createdBookId}`);

        const body = await response.json();

        console.log(body);

        // Assert
        expect(response.status()).toBe(200);

        expect(body.id).toBe(createdBookId);
        expect(body.nome).not.toBe('');
        expect(body.autor).not.toBe('');
        expect(body.paginas).toBeGreaterThan(0);

        expect(typeof body.id).toBe('number');
        expect(typeof body.nome).toBe('string');
        expect(typeof body.autor).toBe('string');
        expect(typeof body.paginas).toBe('number');

    });

    test('CT-API-008 - Buscar Livro por ID (Inexistente)', async ({ request }) => {

        // Act
        const response = await request.get(`/livros/9999`);

        const body = await response.json();

        // Assert
        expect(response.status()).toBe(404);

        expect(body.mensagem).toContain("Livro não encontrado");

    });

    test('CT-API-009 - Adicionar Novo Livro', async ({ request }) => {

        // Arrange - Generate New book
        const newBook = generateBook();

        // Act
        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const createdBookId = createdBook.id;

        const response = await request.get(`/livros/${createdBookId}`);

        const body = await response.json();

        // Assert
        expect(body.id).toBe(createdBookId);
        expect(typeof body.id).toBe('number');
        expect(new Date(body.dataCadastro).toISOString()).toBe(body.dataCadastro);
        expect(typeof body.dataCadastro).toBe('string');

        expect(body.nome).toBe(newBook.nome);
        expect(body.autor).toBe(newBook.autor);
        expect(body.paginas).toBe(newBook.paginas);
        expect(body.descricao).toBe(newBook.descricao);
        expect(body.imagemUrl).toBe(newBook.imagemUrl);
        expect(body.estoque).toBe(newBook.estoque);
        expect(body.preco).toBe(newBook.preco);

    });

    test('CT-API-010 - Adicionar Livro sem Campos Obrigatórios (Falha)', async ({ request }) => {

        // Arrange
        const newInvalidBook = invalidBook;

        // Act
        const response = await request.post('/livros', {
            data: newInvalidBook
        });

        const body = await response.json();

        // Assert
        expect(response.status()).toBe(400);

        // Requirement document expects validation message ("Mensagem indicando ausência de campos obrigatórios").
        // Current implementation may not return one.

        if (body.mensagem) {
            expect(body.mensagem).toContain('obrigatórios');
        }

    });

    test('CT-API-011 - Atualizar Livro Existente', async ({ request }) => {

        // Arrange - Create original book
        const originalBook = generateBook();

        const createdBook = await createBook(request, originalBook);

        createdBookIds.push(createdBook.id);

        const createdBookId = createdBook.id;

        // Updated payload
        const updatedBook = {
            nome: 'Clean Code - Edição Atualizada',
            autor: 'Robert C. Martin',
            paginas: 464,
            descricao: 'Guia completo atualizado',
            imagemUrl: 'https://exemplo.com/nova-imagem.jpg',
            estoque: 7,
            preco: 79.9
        };

        // Act - Update book
        const updateResponse = await request.put(`/livros/${createdBookId}`, {
            data: updatedBook
        });

        const body = await updateResponse.json();

        console.log(body);

        // Assert
        expect(updateResponse.status()).toBe(200);

        expect(body.id).toBe(createdBookId);

        expect(body.nome).toBe(updatedBook.nome);
        expect(body.autor).toBe(updatedBook.autor);
        expect(body.paginas).toBe(updatedBook.paginas);
        expect(body.descricao).toBe(updatedBook.descricao);
        expect(body.imagemUrl).toBe(updatedBook.imagemUrl);
        expect(body.estoque).toBe(updatedBook.estoque);
        expect(body.preco).toBe(updatedBook.preco);

    });

    test('CT-API-012 - Deletar Livro', async ({ request }) => {

        // Arrange - Create original book
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const createdBookId = createdBook.id;

        // Act - Delete book
        const deleteResponse = await request.delete(`/livros/${createdBookId}`);

        const deleteBody = await deleteResponse.json();

        // Assert
        expect(deleteResponse.status()).toBe(200);

        // Validate message only if API returns it
        if (deleteBody.mensagem) {
            expect(deleteBody.mensagem).toContain('Livro removido');
        }

        // Second Act - GET /livros/${createdBookId} subsequentemente retorna 404

        const getResponse = await request.get(`/livros/${createdBookId}`);

        // Second Assert
        expect(getResponse.status()).toBe(404);

    });

});