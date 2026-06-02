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

    test('CT-API-029 - Listar Usuários', async ({ request }) => {

        // Arrange - Create User 1
        const user1 = await createUser(request, generateUser());
       
        createdUserIds.push(user1.usuario.id);

        // Arrange - Create User 2
        const user2 = await createUser(request, generateUser());

        createdUserIds.push(user2.usuario.id);

        // Act - List All Users
        const usersResponse = await request.get('/usuarios');

        const usersBody = await usersResponse.json();

        // Assert
        expect(usersResponse.status()).toBe(200);

        expect(Array.isArray(usersBody)).toBeTruthy();     

        const user1Exists = usersBody.some(
            user => user.id === user1.usuario.id
        );

        const user2Exists = usersBody.some(
            user => user.id === user2.usuario.id
        );

        expect(user1Exists).toBeTruthy();
        expect(user2Exists).toBeTruthy();
        
        for (const user of usersBody) {
            expect(user).not.toHaveProperty('senha');
        };

    });

    test('CT-API-030 - Atualizar Usuário', async ({ request }) => {

        // Arrange - Create User 
        const user = await createUser(request, generateUser());

        createdUserIds.push(user.usuario.id);

        // Act - Update User's name and email
        const updatePayload = {
            nome: `${user.usuario.nome} Atualizado`,
            email: `atualizado_${user.usuario.email}`,
            tipo: 2
        };

        const updatedResponse = await request.put(
            `/usuarios/${user.usuario.id}`, 
            {
                data: updatePayload
            }
        );

        const updatedBody = await updatedResponse.json();

        // Assert
        expect(updatedResponse.status()).toBe(200);

        expect(updatedBody.nome).toBe(updatePayload.nome);
        expect(updatedBody.email).toBe(updatePayload.email);
        expect(updatedBody.tipo).toBe(updatePayload.tipo);    

    });

    test('CT-API-031 - Excluir Usuário (Não-Admin Principal)', async ({ request }) => {

        // Arrange - Create User 
        const user = await createUser(request, generateUser({ tipo: 3 })
        );

        createdUserIds.push(user.usuario.id);

        // Act - Delete User
        const deleteResponse = await request.delete(`/usuarios/${user.usuario.id}`);

        const deletedBody = await deleteResponse.json();

        // Act - Check if User Still exists
        const usersResponse = await request.get('/usuarios');

        const usersBody = await usersResponse.json();

        const userStillExists = usersBody.some(
            existingUser => existingUser.id === user.usuario.id
        );

        // Assert
        expect(deleteResponse.status()).toBe(200);

        if (deletedBody.mensagem) {
            expect(deletedBody.mensagem).toContain('Usuário deletado com sucesso');
        };

        expect(userStillExists).toBeFalsy();

    });

    test('CT-API-032 - Tentar Excluir Admin Principal (Falha)', async ({ request }) => {

        // Arrange - Create User 
        const user = await createUser(request, generateUser({ tipo: 1 })
        );

        createdUserIds.push(user.usuario.id);

        // Act - Delete User
        const deleteResponse = await request.delete(`/usuarios/${user.usuario.tipo}`);

        const deletedBody = await deleteResponse.json();

        // Act - Check if User Still exists
        const usersResponse = await request.get('/usuarios');

        const usersBody = await usersResponse.json();

        const userStillExists = usersBody.some(
            existingUser => existingUser.id === user.usuario.id
        );

        // Assert
        expect(deleteResponse.status()).toBe(403);

        if (deletedBody.mensagem) {
            expect(deletedBody.mensagem).toContain("Admin principal não pode ser deletado");
        };

        expect(userStillExists).toBeTruthy();

    });

});