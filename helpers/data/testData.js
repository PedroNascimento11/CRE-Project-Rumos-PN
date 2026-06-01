import { randomInt } from "node:crypto";

export function generateUser() {
  const timestamp = Date.now();

  return {
    nome: `User ${timestamp}`,
    email: `user${timestamp}@teste.com`,
    senha: 'senha123'
  };
}

export function generateBook(overrides = {}) {

  const timestamp = Date.now();

  return {
    nome: `Livro ${timestamp}`,
    autor: 'Autor Teste',
    paginas: 300,
    descricao: 'Descricao teste',
    imagemUrl: 'https://teste.com/image.jpg',
    estoque: 10,
    preco: 49.9,

    ...overrides
  };
}

export function generateBookRenting(userId, bookId) {
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const year = new Date().getFullYear();
  const timestamp = `${year}-${month}-${day}`;

  const rentingDate = `${year - 1}-${month}-${day}`;
  const rentingEnd = `${year}-${month}-${day}`;

  return {
    usuarioId: userId,
    livroId: bookId,
    dataInicio: rentingDate,
    dataFim: rentingEnd
  };
};

export function generatePurchase(userId, bookId, overrides = {}) {

  return {
    usuarioId: userId,
    livroId: bookId,
    quantidade: 1,

    ...overrides
  };
}



module.exports = {
  generateUser,
  generateBook,
  generateBookRenting,
  generatePurchase
};

