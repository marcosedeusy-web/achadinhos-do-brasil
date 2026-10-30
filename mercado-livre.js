/*
 * ACHADINHOS DO BRASIL — produtos Mercado Livre
 * Cadastro manual, sem API.
 *
 * Quando sua conta de afiliado estiver liberada, adicione produtos ao array
 * abaixo. Use o link de afiliado gerado no painel do Mercado Livre.
 * Não altere os cards da Shopee no index.html.
 */
const produtosMercadoLivre = [
  // Exemplo de cadastro (remova os comentários e substitua pelos dados reais):
  // {
  //   nome: "Nome do produto",
  //   descricao: "Descrição curta do produto.",
  //   preco: "R$ 99,90",
  //   imagem: "./imagens/produto-mercadolivre.jpg",
  //   link: "https://www.mercadolivre.com.br/SEU-LINK-DE-AFILIADO"
  // }
];

(function () {
  const lista = document.getElementById("lista-mercadolivre");
  const vazio = document.getElementById("mercadolivre-vazio");
  if (!lista || !vazio) return;

  const linkMercadoLivreValido = (valor) => {
    try {
      const url = new URL(valor);
      return url.protocol === "https:" &&
        /(^|\\.)mercadolivre\\.com(\\.br)?$|(^|\\.)meli\\.la$/.test(url.hostname);
    } catch {
      return false;
    }
  };

  const criarElemento = (tag, classe, texto) => {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto) elemento.textContent = texto;
    return elemento;
  };

  const cadastrados = produtosMercadoLivre.filter((produto) =>
    produto &&
    typeof produto.nome === "string" &&
    typeof produto.preco === "string" &&
    typeof produto.link === "string" &&
    linkMercadoLivreValido(produto.link)
  );

  if (cadastrados.length === 0) {
    vazio.hidden = false;
    return;
  }

  vazio.hidden = true;

  cadastrados.forEach((produto) => {
    const card = criarElemento("article", "card");
    if (produto.imagem) {
      const areaFoto = criarElemento("div", "foto");
      const imagem = document.createElement("img");
      imagem.src = produto.imagem;
      imagem.alt = produto.nome;
      imagem.loading = "lazy";
      areaFoto.appendChild(imagem);
      card.appendChild(areaFoto);
    }

    card.appendChild(criarElemento("h3", "", produto.nome));
    if (produto.descricao) {
      card.appendChild(criarElemento("p", "desc", produto.descricao));
    }
    card.appendChild(criarElemento("p", "preco", produto.preco));

    const botao = criarElemento("a", "botao", "🛒 Ver oferta no Mercado Livre");
    botao.href = produto.link;
    botao.target = "_blank";
    botao.rel = "noopener noreferrer sponsored";
    card.appendChild(botao);
    lista.appendChild(card);
  });
})();
