(() => {
    const destino = document.getElementById("produtos-destaque");
    if (!destino) return;

    const shopee = document.querySelector(".titulo-shopee + .produtos");
    const mercadoLivre = document.getElementById("produtos-mercado-livre");
    const outros = document.getElementById("produtos-painel-online");
    const origens = [shopee, mercadoLivre, outros].filter(Boolean);

    function listar(secao) {
        if (!secao) return [];
        return Array.from(secao.querySelectorAll(":scope > .produto"))
            .filter(card => !card.classList.contains("filtro-oculto"));
    }

    function atualizarDestaques() {
        const selecionados = [
            ...listar(shopee).slice(0, 2),
            ...listar(mercadoLivre).slice(0, 2)
        ];

        if (selecionados.length < 4) {
            const jaSelecionados = new Set(selecionados);
            for (const card of [...listar(shopee), ...listar(mercadoLivre), ...listar(outros)]) {
                if (!jaSelecionados.has(card)) {
                    selecionados.push(card);
                    jaSelecionados.add(card);
                    if (selecionados.length === 4) break;
                }
            }
        }

        destino.replaceChildren();
        if (!selecionados.length) {
            destino.innerHTML = "<p>Em breve, novos achadinhos em destaque por aqui!</p>";
            return;
        }

        selecionados.forEach(card => {
            const copia = card.cloneNode(true);
            copia.classList.remove("filtro-oculto");
            copia.hidden = false;
            destino.appendChild(copia);
        });
    }

    atualizarDestaques();
    origens.forEach(secao => {
        new MutationObserver(atualizarDestaques).observe(secao, {
            childList: true,
            subtree: true
        });
    });
    window.addEventListener("produtos-atualizados", atualizarDestaques);
})();