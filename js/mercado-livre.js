
const produtosMercadoLivre = [
    {
        nome: "Cartão de memória",
        descricao: "Confira as características e opções disponíveis no anúncio.",
        imagem: "imagens/cartao4.webp",
        link: "https://meli.la/33aiKNy"
    },
    {
        nome: "Escova",
        descricao: "Confira os detalhes e as opções disponíveis no anúncio.",
        imagem: "imagens/escova5.webp",
        link: "https://meli.la/1zQtbNw"
    },
    {
        nome: "Fone de ouvido sem fio",
        descricao: "Confira os detalhes e as opções disponíveis no anúncio.",
        imagem: "imagens/fone6.webp",
        link: "https://meli.la/1JUVTrJ"
    }
];

const areaProdutos = document.getElementById("produtos-mercado-livre");

if (areaProdutos) {
    produtosMercadoLivre.forEach((produto) => {
        const card = document.createElement("article");
        card.className = "produto";

        const imagem = document.createElement("img");
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;
        imagem.loading = "lazy";

        const titulo = document.createElement("h3");
        titulo.textContent = produto.nome;

        const descricao = document.createElement("p");
        descricao.textContent = produto.descricao;

        const preco = document.createElement("strong");
        preco.textContent = "Confira o preço no Mercado Livre";

        const botao = document.createElement("a");
        botao.href = produto.link;
        botao.target = "_blank";
        botao.rel = "noopener noreferrer";
        botao.textContent = "🛒 Ver oferta no Mercado Livre";

        card.append(imagem, titulo, descricao, preco, botao);
        areaProdutos.appendChild(card);
    });
}
