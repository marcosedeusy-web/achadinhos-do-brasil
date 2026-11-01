// Carrega os produtos ativos cadastrados pelo painel online.
// Não altera nem substitui os produtos estáticos da Shopee ou do Mercado Livre.
(() => {
    const area = document.getElementById("produtos-painel-online");
    if (!area) return;

    if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) {
        area.textContent = "Não foi possível conectar à vitrine agora. Tente atualizar a página.";
        console.error("Supabase não carregou: confira a biblioteca e a configuração.");
        return;
    }

    let client;
    try {
        client = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_PUBLISHABLE_KEY
        );
    } catch (erro) {
        area.textContent = "Não foi possível conectar à vitrine agora. Tente atualizar a página.";
        console.error("Erro ao iniciar o Supabase:", erro);
        return;
    }

    const dinheiro = (valor) => {
        if (valor === null || valor === undefined || valor === "") return "Consulte o preço";
        return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    async function carregarProdutos() {
        try {
            const consulta = await Promise.race([
                client
                    .from("produtos")
                    .select("id,nome,descricao,preco,imagem_url,link_afiliado,plataforma")
                    .eq("ativo", true)
                    .order("criado_em", { ascending: false }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Tempo de conexão esgotado")), 12000))
            ]);
            const { data, error } = consulta;

            if (error) {
                area.textContent = "Não foi possível carregar os produtos agora. Tente novamente mais tarde.";
                console.error("Erro ao carregar produtos do painel:", error);
                return;
            }

            if (!data || data.length === 0) {
                area.textContent = "Em breve, novos achadinhos por aqui!";
                return;
            }

            area.innerHTML = "";
            const secaoShopee = document.querySelector(".titulo-shopee + .produtos");
            const secaoMercado = document.getElementById("produtos-mercado-livre");
            const linksAntigos = new Set([
                "https://s.shopee.com.br/30p7lRG6Ku",
                "https://s.shopee.com.br/40hexzGWHO",
                "https://s.shopee.com.br/2gCHMwwXTq",
                "https://s.shopee.com.br/30p7lbUPuf",
                "https://meli.la/33aiKNy",
                "https://meli.la/1zQtbNw",
                "https://meli.la/1JUVTrJ"
            ]);
            data.forEach((produto) => {

            const card = document.createElement("article");
            const loja = String(produto.plataforma || "").toLowerCase();
            card.className = "produto " + (loja.includes("mercado") ? "produto-mercado-livre" : "produto-shopee");

            if (produto.imagem_url) {
                const imagem = document.createElement("img");
                imagem.src = produto.imagem_url;
                imagem.alt = produto.nome || "Produto";
                imagem.loading = "lazy";
                if (produto.link_afiliado) {
                    const linkImagem = document.createElement("a");
                    linkImagem.className = "imagem-produto-link";
                    linkImagem.href = produto.link_afiliado;
                    linkImagem.target = "_blank";
                    linkImagem.rel = "noopener noreferrer";
                    linkImagem.appendChild(imagem);
                    card.appendChild(linkImagem);
                } else {
                    card.appendChild(imagem);
                }
            }

            const titulo = document.createElement("h3");
            titulo.textContent = produto.nome || "Produto";
            card.appendChild(titulo);

            if (produto.descricao) {
                const descricao = document.createElement("p");
                descricao.textContent = produto.descricao;
                card.appendChild(descricao);
            }

            const preco = document.createElement("strong");
            preco.textContent = dinheiro(produto.preco);
            card.appendChild(preco);

            const plataforma = document.createElement("small");
            plataforma.textContent = produto.plataforma || "Loja parceira";
            card.appendChild(plataforma);

            if (produto.link_afiliado) {
                const link = document.createElement("a");
                link.href = produto.link_afiliado;
                link.textContent = loja.includes("mercado") ? "🛒 Ver Ofertas do Mercado Livre" : loja.includes("shopee") ? "🛒 Ver Ofertas da Shopee" : "🛒 Ver oferta";
                card.appendChild(link);
            }

                const linkNormalizado = (produto.link_afiliado || "").replace(/\/$/, "");
                const ehAntigo = linksAntigos.has(linkNormalizado);

                if (ehAntigo) {
                    document.querySelectorAll(".produtos a[href]").forEach(linkAntigo => {
                        if (linkAntigo.href.replace(/\/$/, "") === linkNormalizado) {
                            const cartaoAntigo = linkAntigo.closest(".produto");
                            if (cartaoAntigo) cartaoAntigo.remove();
                        }
                    });
                }

                // Organiza todos os produtos pela plataforma, não apenas os links antigos.
                if (loja.includes("mercado")) {
                    secaoMercado.appendChild(card);
                } else if (loja.includes("shopee")) {
                    secaoShopee.appendChild(card);
                } else {
                    area.appendChild(card);
                }
            });
            if (!area.children.length) area.textContent = "Em breve, novos achadinhos por aqui!";
            window.dispatchEvent(new Event("produtos-atualizados"));
        } catch (erro) {
            area.textContent = "Não foi possível carregar os produtos agora. Tente atualizar a página.";
            console.error("Falha na conexão com a vitrine:", erro);
        }
    }

    carregarProdutos();
})();
