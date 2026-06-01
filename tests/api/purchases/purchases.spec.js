import { test, expect } from '@playwright/test';
import { 
    generateUser,
    generateBook,
    generatePurchase
} from '../../../helpers/data/testData';
import { createUser} from '../../../helpers/api/users';
import { createBook } from '../../../helpers/api/books';

test.describe('Purchase Books API', () => {

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

    test('CT-API-023 - Criar Compra com Estoque Suficiente', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book and Generate Purchase
        const newBook = generateBook();

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const purchasePayload = generatePurchase(
            createdUser.usuario.id, 
            createdBook.id, 
            {
                quantidade: 2 
            }
        );

        // Act
        const purchaseResponse = await request.post('/compras', {
            data: purchasePayload
        });

        const purchaseBody = await purchaseResponse.json();

        console.log(purchaseBody);

        // Assert
        expect(purchaseResponse.status()).toBe(201);

        expect(purchaseBody).toHaveProperty('id');
        expect(purchaseBody).toHaveProperty('usuarioId');
        expect(purchaseBody).toHaveProperty('livroId');
        expect(purchaseBody).toHaveProperty('status');
        expect(purchaseBody).toHaveProperty('total');

        expect(purchaseBody.usuarioId).toBe(createdUser.usuario.id);

        expect(purchaseBody.livroId).toBe(createdBook.id);

        expect(purchaseBody.status).toBe('PENDENTE');

        expect(purchaseBody.total).toBeCloseTo(createdBook.preco * purchasePayload.quantidade, 2);

    });

    test('CT-API-024 - Criar Compra com Estoque Insuficiente (Falha)', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book and Generate Purchase
        const newBook = generateBook(
            {
                estoque: 99
            }
        );

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const purchasePayload = generatePurchase(
            createdUser.usuario.id, 
            createdBook.id, 
            {
                quantidade: 100 
            }
        );

        // Act
        const purchaseResponse = await request.post('/compras', {
            data: purchasePayload
        });

        const purchaseBody = await purchaseResponse.json();

        console.log(purchaseBody);

        // Assert
        expect(purchaseResponse.status()).toBe(400);

        expect(purchaseBody.mensagem).toContain('Estoque insuficiente');

    });

    test('CT-API-025 - Aprovar Compra', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book and Generate Purchase
        const newBook = generateBook(
            {
                estoque: 10
            }
        );

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const purchasePayload = generatePurchase(
            createdUser.usuario.id, 
            createdBook.id, 
            {
                quantidade: 2 
            }
        );

        // Act
        const purchaseResponse = await request.post('/compras', {
            data: purchasePayload
        });

        const createdPurchase = await purchaseResponse.json();

        console.log(createdPurchase);

        const purchaseId = createdPurchase.id;

            // Second Act - Putting Arrendamento status to Approved
        const updateResponse = await request.put(
            `/compras/${purchaseId}/status`,
            {
                data: {
                    status: 'APROVADA'
                }
            }
        );

        const updatedPurchase = await updateResponse.json();

        console.log(updatedPurchase);

            // Third Act - Validating current Bock Stock
        const updatedBookResponse = await request.get(
            `/livros/${createdBook.id}`
        );

        const updatedBook = await updatedBookResponse.json();

        console.log(updatedBook);

        // Assert
        expect(updateResponse.status()).toBe(200);

        expect(updatedPurchase.status).toContain('APROVADA');

        expect(updatedBook.estoque).toBe(newBook.estoque - purchasePayload.quantidade);

    });

    test('CT-API-026 - Cancelar Compra', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book and Generate Purchase
        const newBook = generateBook(
            {
                estoque: 10
            }
        );

        const createdBook = await createBook(request, newBook);

        createdBookIds.push(createdBook.id);

        const purchasePayload = generatePurchase(
            createdUser.usuario.id, 
            createdBook.id, 
            {
                quantidade: 2 
            }
        );

        // Act
        const purchaseResponse = await request.post('/compras', {
            data: purchasePayload
        });

        const createdPurchase = await purchaseResponse.json();

        console.log(createdPurchase);

        const purchaseId = createdPurchase.id;

            // Second Act - Putting Arrendamento status to Approved
        const updateResponse = await request.put(
            `/compras/${purchaseId}/status`,
            {
                data: {
                    status: 'CANCELADA'
                }
            }
        );

        const updatedPurchase = await updateResponse.json();

        console.log(updatedPurchase);

            // Third Act - Validating current Bock Stock
        const updatedBookResponse = await request.get(
            `/livros/${createdBook.id}`
        );

        const updatedBook = await updatedBookResponse.json();

        console.log(updatedBook);

        // Assert
        expect(updateResponse.status()).toBe(200);

        expect(updatedPurchase.status).toContain('CANCELADA');

        expect(updatedBook.estoque).toBe(newBook.estoque);

    });

    test('CT-API-027 - Listar Compras do Usuário', async ({ request }) => {

       // Arrange - Create user
        const newUser = generateUser();

        const createdUser = await createUser(request, newUser);

        createdUserIds.push(createdUser.usuario.id);

        // Arrange - Create book number 1 and Generate Purchase
        const newBook1 = generateBook(
            {
                estoque: 10
            }
        );

        const createdBook1 = await createBook(request, newBook1);

        createdBookIds.push(createdBook1.id);

        const purchasePayload1 = generatePurchase(
            createdUser.usuario.id, 
            createdBook1.id, 
            {
                quantidade: 2 
            }
        );

        // Arrange - Create book number 2 and Generate Purchase
        const newBook2 = generateBook(
            {
                estoque: 10
            }
        );

        const createdBook2 = await createBook(request, newBook2);

        createdBookIds.push(createdBook2.id);

        const purchasePayload2 = generatePurchase(
            createdUser.usuario.id,
            createdBook2.id, 
            {
                quantidade: 2 
            }
        );

        // Act - Book number 1
        const purchaseResponse1 = await request.post('/compras', {
            data: purchasePayload1
        });

        const createdPurchase1 = await purchaseResponse1.json();

        // Act - Book number 2
        const purchaseResponse2 = await request.post('/compras', {
            data: purchasePayload2
        });

        const createdPurchase2 = await purchaseResponse2.json();

        console.log(createdPurchase1);
        console.log(createdPurchase2);

        const purchaseId1 = createdPurchase1.id;
        const purchaseId2 = createdPurchase2.id;


            // Second Act - List All Purchases for the user
        const purchaseListResponse = await request.get(`/compras/me?usuarioId=${createdUser.usuario.id}`);

        const createdPurchases = await purchaseListResponse.json();

        console.log(createdPurchases);

            // Third Act - See that the purchases exist
        const purchase1Exists = createdPurchases.some(
            purchase => purchase.id === purchaseId1
        );

        const purchase2Exists = createdPurchases.some(
            purchase => purchase.id === purchaseId2
        );


        // Assert
        expect(purchaseListResponse.status()).toBe(200);

        for (const purchase of createdPurchases) {
            expect(purchase.usuarioId).toBe(createdUser.usuario.id);
        }

        expect(createdPurchases.length).toBeGreaterThanOrEqual(2);

    });

    test('CT-API-028 - Listar Todas as Compras', async ({ request }) => {

        // Arrange - Create User 1
        const user1 = await createUser(request, generateUser());

        createdUserIds.push(user1.usuario.id);

        // Arrange - Create User 2
        const user2 = await createUser(request, generateUser());

        createdUserIds.push(user2.usuario.id);

        // Arrange - Create Book 1
        const book1 = await createBook(request, generateBook());

        createdBookIds.push(book1.id);

        // Arrange - Create Book 2
        const book2 = await createBook(request, generateBook());

        createdBookIds.push(book2.id);

        // Act - Purchase Book 1
        const purchase1Response = await request.post('/compras', {
            data: generatePurchase(
            user1.usuario.id,
            book1.id
            )
        });

        const purchase1 = await purchase1Response.json();

        // Act - Purchase Book 2
        const purchase2Response = await request.post('/compras', {
            data: generatePurchase(
            user2.usuario.id,
            book2.id
            )
        });

        const purchase2 = await purchase2Response.json();

        // Act - List All Purchases
        const response = await request.get('/compras');

        const body = await response.json();

        console.log(body);

        // Assert
        expect(response.status()).toBe(200);

        expect(Array.isArray(body)).toBeTruthy();

        const purchase1Exists = body.some(
            purchase => purchase.id === purchase1.id
        );

        const purchase2Exists = body.some(
            purchase => purchase.id === purchase2.id
        );

        expect(purchase1Exists).toBeTruthy();
        expect(purchase2Exists).toBeTruthy();

    });

});