import { test, expect } from '@playwright/test';
import { 
    generateUser,
    generateBook
} from '../../../helpers/data/testData';
import { createUser} from '../../../helpers/api/users';
import { createBook } from '../../../helpers/api/books';

test.describe('Favorites API', () => {

    let createdUserIds = [];
    let createdBookIds = [];

    test.afterEach(async ({ request }) => {

        for (const userId of createdUserIds) {

        try {
            await request.delete(`/usuarios/${userId}`);
        } catch (error) {
            console.log(`Failed to delete book ${userId}`);
        }
        }

        createdUserIds = [];


        for (const bookId of createdBookIds) {

        try {
            await request.delete(`/livros/${bookId}`);
        } catch (error) {
            console.log(`Failed to delete book ${bookId}`);
        }
        }

        createdBookIds = [];
    });

    test('CT-API-014 - Adicionar Livro aos Favoritos', async ({ request }) => {

        // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        // Favorite payload
        const favoritePayload = {
            usuarioId: createdUser.usuario.id,
            livroId: createdBook.id
        };

        // Act
        const response = await request.post('/favoritos', {
            data: favoritePayload
        });

        const body = await response.json();

        console.log(body);

        // Assert
        expect(response.status()).toBe(201);

        if (body.mensagem) {
            expect(body.mensagem).toContain('favoritos');
        }

    });

    test('CT-API-015 - Adicionar Livro Já Favoritado (Falha)', async ({ request }) => {

        // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        // Favorite payload
        const favoritePayload = {
            usuarioId: createdUser.usuario.id,
            livroId: createdBook.id
        };

        // Act
        const response = await request.post('/favoritos', {
            data: favoritePayload
        });

        const body = await response.json();

        console.log(body);

        // Assert
        expect(response.status()).toBe(201);

        if (body.mensagem) {
            expect(body.mensagem).toContain('favoritos');
        }

            // Second Act - Try to Add same book for the same user to Favorites
        const failedResponse = await request.post('/favoritos', {
            data: favoritePayload
        });

        const failedBody = await failedResponse.json();

            // Second Assert - Validate that is not possible to Add the same book for the same user to Favorites
        expect(failedResponse.status()).toBe(400);

        if (failedBody.mensagem) {
            expect(failedBody.mensagem).toContain('favoritos');
        }

    });

    test('CT-API-016 - Listar Favoritos de Usuário', async ({ request }) => {

        // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        // Favorite payload
        const favoritePayload = {
            usuarioId: createdUser.usuario.id,
            livroId: createdBook.id
        };

        // Act - Post New Favorite Book
        const addFavoriteResponse = await request.post('/favoritos', {
            data: favoritePayload
        });

        const body = await addFavoriteResponse.json();

        console.log(body);

        // Assert - Verify new book is saved on Favorites
        expect(addFavoriteResponse.status()).toBe(201);

        if (body.mensagem) {
            expect(body.mensagem).toContain('favoritos');
        }

            // Second Act - GET Favorite Books by usuarioId
        const userFavoritesResponse = await request.get(`/favoritos/${createdUser.usuario.id}`);

        const usersFavoriteBody = await userFavoritesResponse.json();

        const favoriteBook = usersFavoriteBody.find(
            book => book.id === createdBook.id
        );

            // Second Assert - Validate all of user's Favorite Books are returned
        expect(userFavoritesResponse.status()).toBe(200);

        expect(Array.isArray(usersFavoriteBody)).toBeTruthy();

        expect(favoriteBook).toBeDefined();

        expect(favoriteBook.nome).toBe(createdBook.nome);
        expect(favoriteBook.autor).toBe(createdBook.autor);

        console.log(usersFavoriteBody);

    });

    test('CT-API-017 - Remover Livro dos Favoritos', async ({ request }) => {

        // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        // Favorite payload
        const favoritePayload = {
            usuarioId: createdUser.usuario.id,
            livroId: createdBook.id
        };

        // Act - Post New Favorite Book
        const addFavoriteResponse = await request.post('/favoritos', {
            data: favoritePayload
        });

        const body = await addFavoriteResponse.json();

        console.log(body);

        // Assert - Verify new book is saved on Favorites
        expect(addFavoriteResponse.status()).toBe(201);

        if (body.mensagem) {
            expect(body.mensagem).toContain('favoritos');
        }

            // Second Act - DELETE Favorite Book by usuarioId and livroId AND GET response from the usuarioId
        const deleteResponse = await request.delete('/favoritos', {
            data: favoritePayload
        });

        const deletedBody = await deleteResponse.json();

        const userFavoritesResponse = await request.get(
            `/favoritos/${createdUser.usuario.id}`
        );

        const userFavoritesBody = await userFavoritesResponse.json();

        const favoriteStillExists = userFavoritesBody.some(
            book => book.id === createdBook.id
        );

            // Second Assert - Validate user's Favorite Books is Deleted
        expect(deleteResponse.status()).toBe(200);

        if (deletedBody.mensagem) {
            expect(deletedBody.mensagem).toContain("Livro removido dos favoritos");
        };

        expect(favoriteStillExists).toBeFalsy();

    });

});