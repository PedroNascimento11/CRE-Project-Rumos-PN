import { test, expect } from '@playwright/test';

test.describe('Statistics API', () => {

    test('CT-API-013 - Obter Estatísticas da Biblioteca', async ({ request }) => {

        // Act
        const response = await request.get('/estatisticas');

        const body = await response.json();

        console.log(body);


        // Assert
        expect(response.status()).toBe(200);

            // Body contains: totalLivros, totalPaginas, totalUsuarios, usuariosPorTipo, livrosDisponiveis, arrendamentosPendentes, comprasPendentes
        expect(body).toHaveProperty('totalLivros');
        expect(body).toHaveProperty('totalPaginas');
        expect(body).toHaveProperty('totalUsuarios');
        expect(body).toHaveProperty('usuariosPorTipo');
        expect(body).toHaveProperty('livrosDisponiveis');
        expect(body).toHaveProperty('arrendamentosPendentes');
        expect(body).toHaveProperty('comprasPendentes');

            // All numeric values are integers ≥ 0
        expect(body.totalLivros).toBeGreaterThanOrEqual(0);
        expect(body.totalPaginas).toBeGreaterThanOrEqual(0);
        expect(body.totalUsuarios).toBeGreaterThanOrEqual(0);
        expect(body.usuariosPorTipo.alunos).toBeGreaterThanOrEqual(0);
        expect(body.usuariosPorTipo.funcionarios).toBeGreaterThanOrEqual(0);
        expect(body.usuariosPorTipo.admins).toBeGreaterThanOrEqual(0);
        expect(body.livrosDisponiveis).toBeGreaterThanOrEqual(0);
        expect(body.arrendamentosPendentes).toBeGreaterThanOrEqual(0);
        expect(body.comprasPendentes).toBeGreaterThanOrEqual(0);

            // Sum of usuariosPorTipo.alunos + funcionarios + admins = totalUsuarios
        expect(body.totalUsuarios).toEqual(body.usuariosPorTipo.alunos + body.usuariosPorTipo.funcionarios + body.usuariosPorTipo.admins);

            // Validate usersByType structure
        expect(body.usuariosPorTipo).toHaveProperty('alunos');
        expect(body.usuariosPorTipo).toHaveProperty('funcionarios');
        expect(body.usuariosPorTipo).toHaveProperty('admins');

            // Validate totalUsuarios consistency
        expect(body.totalUsuarios).toBe(
            body.usuariosPorTipo.alunos +
            body.usuariosPorTipo.funcionarios +
            body.usuariosPorTipo.admins
        );

    });
});