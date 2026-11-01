// Carrega os produtos ativos cadastrados pelo painel online.
// Não altera nem substitui os produtos estáticos da Shopee ou do Mercado Livre.
(() => {
    const area = document.getElementById("produtos-painel-online");
    if (!area || !window.supabase || !window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) return;

    const client = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
    );

    const dinheiro = (valor) => {
        if (valor === null || valor === undefined || valor === "") return "Consulte o preço";
        return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    async function carregarProdutos() {
        const { data, error } = await client
            .from("produtos")
            .select("id,nome,descricao,preco,imagem_url,link_afiliado,plataforma")
            .eq("ativo", true)
            .order("criado_em", { ascending: false });

        if (error) {
            area.textContent = "Não foi possível carregar os produtos agora.";
            console.error("Erro ao carregar produtos do painel:", error);
            return;
        }

        if (!data || data.length === 0) {
            area.textContent = "Em breve, novos achadinhos por aqui!";
            return;
        }

        data.forEach((produto) => {
            const card = document.createElement("article");
            const loja = String(produto.plataforma || "").toLowerCase();
            card.className = "produto " + (loja.includes("mercado") ? "produto-mercado-livre" : "produto-shopee");

            if (produto.imagem_url) {
                const imagem = document.createElement("img");
                imagem.src = produto.imagem_url;
                imagem.alt = produto.nome || "Produto";
                imagem.loading = "lazy";
                card.appendChild(imagem);
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
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = loja.includes("mercado") ? "🛒 Ver oferta no Mercado Livre" : loja.includes("shopee") ? "🛒 Ver oferta na Shopee" : "🛒 Ver oferta";
                card.appendChild(link);
            }

            area.appendChild(card);
        });
    }

    carregarProdutos();
})();
