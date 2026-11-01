(() => {
    const POR_PAGINA = 8;
    const estados = new WeakMap();

    function atualizar(secao) {
        if (!secao) return;
        const produtos = Array.from(secao.children).filter(el => el.classList.contains("produto"));
        let controles = secao.nextElementSibling;
        if (!controles || !controles.classList.contains("paginacao-produtos")) {
            controles = document.createElement("nav");
            controles.className = "paginacao-produtos";
            controles.setAttribute("aria-label", "Páginas de produtos");
            secao.insertAdjacentElement("afterend", controles);
        }
        const total = Math.max(1, Math.ceil(produtos.length / POR_PAGINA));
        const estado = estados.get(secao) || { pagina: 1 };
        estado.pagina = Math.min(estado.pagina, total);
        estados.set(secao, estado);
        produtos.forEach((produto, i) => {
            produto.hidden = i < (estado.pagina - 1) * POR_PAGINA || i >= estado.pagina * POR_PAGINA;
        });
        controles.innerHTML = "";
        if (total <= 1) { controles.hidden = true; return; }
        controles.hidden = false;
        const criarBotao = (texto, pagina, ativo, desabilitado) => {
            const b = document.createElement("button");
            b.type = "button"; b.textContent = texto; b.disabled = !!desabilitado;
            if (ativo) b.className = "pagina-ativa";
            b.addEventListener("click", () => {
                estado.pagina = pagina; atualizar(secao);
                secao.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            controles.appendChild(b);
        };
        criarBotao("‹ Anterior", estado.pagina - 1, false, estado.pagina === 1);
        for (let p = 1; p <= total; p++) criarBotao(String(p), p, p === estado.pagina, false);
        criarBotao("Próxima ›", estado.pagina + 1, false, estado.pagina === total);
    }

    function atualizarTodas() {
        document.querySelectorAll(".titulo-shopee + .produtos, #produtos-mercado-livre, #produtos-painel-online").forEach(atualizar);
    }
    document.addEventListener("DOMContentLoaded", atualizarTodas);
    window.addEventListener("produtos-atualizados", atualizarTodas);
    atualizarTodas();
})();
