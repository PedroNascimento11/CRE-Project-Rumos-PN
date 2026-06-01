import { expect } from '@playwright/test';

export async function createUser(request, userData) {

  const response = await request.post('/registro', {
    data: userData
  });

  expect(response.status()).toBe(201);

  return await response.json();
}