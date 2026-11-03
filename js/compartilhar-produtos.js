(() => {
    function adicionarBotoesCompartilhar() {
        document.querySelectorAll(".produto").forEach(card => {
            if (card.querySelector(".botao-compartilhar")) return;
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "botao-compartilhar";
            botao.textContent = "↗ Compartilhar oferta";
            botao.setAttribute("aria-label", "Compartilhar este produto");
            card.appendChild(botao);
        });
    }

    document.addEventListener("click", async (evento) => {
        const botao = evento.target.closest(".botao-compartilhar");
        if (!botao) return;

        const card = botao.closest(".produto");
        if (!card) return;
        const titulo = card.querySelector("h3")?.textContent?.trim() || "Achadinho do Brasil";
        const linkOferta = card.querySelector('a:not(.imagem-produto-link)[href], .imagem-produto-link[href]')?.href || window.location.href;
        const dados = {
            title: titulo + " | Achadinhos do Brasil",
            text: "Olha este achadinho que encontrei!",
            url: linkOferta
        };

        try {
            if (navigator.share) {
                await navigator.share(dados);
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(dados.text + " " + dados.url);
                const original = botao.textContent;
                botao.textContent = "✓ Link copiado!";
                setTimeout(() => { botao.textContent = original; }, 2200);
            } else {
                window.prompt("Copie o link desta oferta:", dados.url);
            }
        } catch (erro) {
            if (erro.name !== "AbortError") {
                window.prompt("Copie o link desta oferta:", dados.url);
            }
        }
    });

    adicionarBotoesCompartilhar();
    new MutationObserver(adicionarBotoesCompartilhar).observe(document.body, {
        childList: true,
        subtree: true
    });
})();