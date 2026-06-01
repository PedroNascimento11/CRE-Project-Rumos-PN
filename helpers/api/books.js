import { expect } from '@playwright/test';

export async function createBook(request, bookData) {

  const response = await request.post('/livros', {
    data: bookData
  });

  expect(response.status()).toBe(201);

  return await response.json();
}

export async function deleteBook(request, bookId) {

  const response = await request.delete(`/livros/${bookId}`);

  expect(response.status()).toBe(200);

  return await response.json();
}