import { test, expect } from '@playwright/test';
import { 
    generateUser,
    generateBook,
    generateBookRenting
} from '../../../helpers/data/testData';
import { createUser} from '../../../helpers/api/users';
import { createBook } from '../../../helpers/api/books';

test.describe('Renting Books API', () => {

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

    test('CT-API-018 - Criar Arrendamento Válido', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const rentingPayload = generateBookRenting(createdUser.usuario.id, createdBook.id);

        // Act
        const rentingResponse = await request.post('/arrendamentos', {
            data: rentingPayload
        });

        const rentingBody = await rentingResponse.json();

        // Assert
        expect(rentingResponse.status()).toBe(201);

        expect(rentingBody).toHaveProperty('id');
        expect(rentingBody).toHaveProperty('usuarioId');
        expect(rentingBody).toHaveProperty('livroId');
        expect(rentingBody).toHaveProperty('status');
        expect(rentingBody).toHaveProperty('criadoEm');

        expect(typeof rentingBody.id).toBe('number');

        expect(rentingBody.usuarioId).toBe(createdUser.usuario.id);
        expect(rentingBody.livroId).toBe(createdBook.id);

        expect(rentingBody.status).toBe('PENDENTE');

        expect(
            new Date(rentingBody.criadoEm).toISOString()
                ).toBe(rentingBody.criadoEm);

    });

    test('CT-API-019 - Criar Arrendamento sem Estoque (Falha)', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook({
            estoque : 0
        });

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const rentingPayload = generateBookRenting(createdUser.usuario.id, createdBook.id);

        // Act
        const rentingResponse = await request.post('/arrendamentos', {
            data: rentingPayload
        });

        const rentingBody = await rentingResponse.json();

        // Assert

            // Current implementation allows arrendamento for books with estoque = 0
            // Requirement expects HTTP 400 status
        expect(rentingResponse.status()).toBe(400);

        expect(rentingBody.mensagem).toContain('Livro sem estoque para arrendamento');

    });

    test('CT-API-020 - Atualizar Status de Arrendamento para APROVADO', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook({
            estoque : 2
        });

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const rentingPayload = generateBookRenting(createdUser.usuario.id, createdBook.id);

        // Act
        const rentingPostResponse = await request.post('/arrendamentos', {
            data: rentingPayload
        });

        const createdRenting = await rentingPostResponse.json();

        const rentingId = createdRenting.id;

            // Second Act - Putting Arrendamento status to Approved
        const updateResponse = await request.put(
            `/arrendamentos/${rentingId}/status`,
            {
                data: {
                    status: 'APROVADO'
                }
            }
        );

        const rentingPutBody = await updateResponse.json();

            // Third Act - Get Book "estoque" again to validate it got reduced by 1
        const updatedBookResponse = await request.get(
            `/livros/${createdBook.id}`
        );

        const updatedBook = await updatedBookResponse.json();

        console.log('Created book:', createdBook);
        console.log('Updated book:', updatedBook);

        // Assert
        expect(updateResponse.status()).toBe(200);

        expect(rentingPutBody.status).toBe('APROVADO');

        expect(updatedBook.estoque).toBe(1);

    });

    test('CT-API-021 - Atualizar Status com Valor Inválido (Falha)', async ({ request }) => {

      // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book
        const newBook = generateBook({
            estoque : 2
        });

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const rentingPayload = generateBookRenting(createdUser.usuario.id, createdBook.id);

        // Act
        const rentingPostResponse = await request.post('/arrendamentos', {
            data: rentingPayload
        });

        const createdRenting = await rentingPostResponse.json();

        const rentingId = createdRenting.id;

            // Second Act - Putting Arrendamento status to Approved
        const updateResponse = await request.put(
            `/arrendamentos/${rentingId}/status`,
            {
                data: {
                    status: 'EM_ANALISE'
                }
            }
        );

        const rentingPutBody = await updateResponse.json();

        // Assert
        expect(updateResponse.status()).toBe(400);

        expect(rentingPutBody.mensagem).toBe('Status inválido');

    });

    test('CT-API-022 - Listar Arrendamentos do Usuário', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book number 1
        const newBook1 = generateBook();

        const createdBook1 = await createBook(request, newBook1);

        createdBookIds.push(createdBook1.id);

        const rentingPayload1 = generateBookRenting(createdUser.usuario.id, createdBook1.id);

        // Arrange - Create book number 2
        const newBook2 = generateBook();

        const createdBook2 = await createBook(request, newBook2);

        createdBookIds.push(createdBook2.id);

        const rentingPayload2 = generateBookRenting(createdUser.usuario.id, createdBook2.id);

        // Act - Book number 1
        const rentingResponse1 = await request.post('/arrendamentos', {
            data: rentingPayload1
        });

        const rentingBody1 = await rentingResponse1.json();

        // Act - Book number 2
        const rentingResponse2 = await request.post('/arrendamentos', {
            data: rentingPayload2
        });

        const rentingBody2 = await rentingResponse2.json();

        // Act - GET List of all user's Book renting
        const rentingListResponse = await request.get(`/arrendamentos/me?usuarioId=${createdUser.usuario.id}`);

        const rentingListBody = await rentingListResponse.json();

        // Act - See that the rentals exist
        const rental1Exists = rentingListBody.some(
            item => item.id === rentingBody1.id
        );

        const rental2Exists = rentingListBody.some(
            item => item.id === rentingBody2.id
        );


        // Assert
        expect(rentingResponse1.status()).toBe(201);
        expect(rentingResponse2.status()).toBe(201);

        expect(rentingListResponse.status()).toBe(200);
        expect(Array.isArray(rentingListBody)).toBeTruthy();

        for (const rental of rentingListBody) {
            expect(rental.usuarioId).toBe(createdUser.usuario.id);
        }

        expect(rentingListBody.length).toBeGreaterThanOrEqual(2);
        expect(rental1Exists).toBeTruthy();
        expect(rental2Exists).toBeTruthy();
        
    });

});