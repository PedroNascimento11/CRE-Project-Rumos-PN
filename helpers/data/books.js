const validBook = {
  nome: 'Clean Code',
  autor: 'Robert C. Martin',
  paginas: 425,
  descricao: 'Manual de boas práticas',
  imagemUrl: 'https://exemplo.com/imagem.jpg',
  estoque: 10,
  preco: 59.9
};

const invalidBook = {
  nome: '',
  autor: '',
  paginas: null
};

module.exports = {
  validBook,
  invalidBook
};