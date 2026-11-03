
const produtosMercadoLivre = [
    {
        nome: "Cartão de memória para armazenamento",
        descricao: "Uma opção para guardar fotos, vídeos e arquivos. Confira no anúncio a capacidade, a compatibilidade e a velocidade do modelo antes de comprar."
        imagem: "imagens/cartao4.webp",
        link: "https://meli.la/33aiKNy"
    },
    {
        nome: "Escova para uso diário",
        descricao: "Confira no anúncio o tipo de escova, os materiais e a indicação de uso para escolher a opção adequada."
        imagem: "imagens/escova5.webp",
        link: "https://meli.la/1zQtbNw"
    },
    {
        nome: "Fone de ouvido sem fio",
        descricao: "Ouça músicas e acompanhe chamadas sem a conexão de cabo. Consulte no anúncio a autonomia da bateria, a compatibilidade e os recursos do modelo."
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

        const linkImagem = document.createElement("a");
        linkImagem.className = "imagem-produto-link";
        linkImagem.href = produto.link;
        linkImagem.target = "_blank";
        linkImagem.rel = "noopener noreferrer";
        linkImagem.appendChild(imagem);

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
        botao.textContent = "🛒 Ver Ofertas do Mercado Livre";

        card.append(linkImagem, titulo, descricao, preco, botao);
        areaProdutos.appendChild(card);
    });
}
