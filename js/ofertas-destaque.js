(() => {
    const destino = document.getElementById("produtos-destaque");
    if (!destino) return;

    const origens = [
        document.querySelector(".titulo-shopee + .produtos"),
        document.getElementById("produtos-mercado-livre"),
        document.getElementById("produtos-painel-online")
    ].filter(Boolean);

    function atualizarDestaques() {
        const produtos = [];
        origens.forEach(secao => {
            secao.querySelectorAll(":scope > .produto").forEach(card => {
                if (!card.classList.contains("filtro-oculto") && produtos.length < 4) {
                    produtos.push(card);
                }
            });
        });

        destino.replaceChildren();
        if (!produtos.length) {
            destino.innerHTML = "<p>Em breve, novos achadinhos em destaque por aqui!</p>";
            return;
        }

        produtos.forEach(card => {
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