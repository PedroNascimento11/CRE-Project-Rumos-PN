import { test, expect } from '@playwright/test';
import { generateUser } from '../../../helpers/data/testData';
import {
  adminUser,
  invalidUser
} from '../../../helpers/data/users'; 

test.describe('Authentication API', () => {

    test('CT-API-001 - Registro de Novo Usuário Aluno (Sucesso)', async ({ request }) => {

        // Arrange
        const newUser = generateUser();

        // Act
        const response = await request.post('/registro', {
            data: newUser
        });

        const body = await response.json();

        // Assert
        expect(response.status()).toBe(201);

        expect(body.mensagem).toContain("Usuário criado com sucesso");

        expect(body.usuario).toHaveProperty('id');
        expect(body.usuario.nome).toBe(newUser.nome);
        expect(body.usuario.email).toBe(newUser.email);

        expect(body.usuario.senha).toBeUndefined();
        expect(body.usuario.id).toBeGreaterThan(0);
        expect(body.usuario.tipo).toBe(1);

    });

    test('CT-API-002 - Registro com Email Duplicado (Falha)', async ({ request }) => {

        // Arrange
        const newUser = generateUser();

        newUser.email = 'admin@biblioteca.com';

        // Act
        const response = await request.post('/registro', {
            data: newUser
        });

        const body = await response.json();

        // Assert
        expect(response.status()).toBe(400);

        expect(body.mensagem).toContain("Email já cadastrado");

    });

    test('CT-API-003 - Login com Credenciais Válidas (Admin)', async ({ request }) => {

        // Arrange
        const newUser = adminUser;

        const startTime = Date.now();

        // Act
        const response = await request.post('/login', {
            data: newUser
        });

        const responseTime = Date.now() - startTime;

        const body = await response.json();

        // Assert
        expect(response.status()).toBe(200);

        expect(body.mensagem).toContain("Login realizado com sucesso");

        expect(body.usuario.senha).toBeUndefined();
        expect(body.usuario.tipo).toBe(3);
        expect(responseTime).toBeLessThan(2000)

    });

    test('CT-API-004 - Login com Credenciais Inválidas', async ({ request }) => {

        // Arrange
        const newUser = invalidUser;

        // Act
        const response = await request.post('/login', {
            data: newUser
        });

        const body = await response.json();

        // Assert
        expect(response.status()).toBe(401);

        expect(body.mensagem).toContain("Email ou senha incorretos");

    });

});