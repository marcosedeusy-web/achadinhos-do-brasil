(() => {
    const busca = document.getElementById("busca-produtos");
    const categoria = document.getElementById("categoria-produtos");
    const contador = document.getElementById("resultado-filtros");
    if (!busca || !categoria || !contador) return;

    const secoes = [
        document.querySelector(".titulo-shopee + .produtos"),
        document.getElementById("produtos-mercado-livre"),
        document.getElementById("produtos-painel-online")
    ].filter(Boolean);

    const normalizar = (texto) => String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const normalizarCategoria = (texto) =>
        normalizar(texto).replace(/[\s-]+/g, "_");

    function aplicarFiltros() {
        const termo = normalizar(busca.value);
        const selecionada = normalizarCategoria(categoria.value);
        let encontrados = 0;
        let total = 0;

        secoes.forEach(secao => {
            // Busca também produtos que estejam dentro de contêineres internos.
            secao.querySelectorAll(".produto").forEach(card => {
                total++;
                const texto = normalizar(card.innerText || card.textContent);
                const categoriaCard = normalizarCategoria(card.dataset.categoria || "outros");
                const correspondeTexto = !termo || texto.includes(termo);
                const correspondeCategoria =
                    selecionada === "todos" || categoriaCard === selecionada;
                const visivel = correspondeTexto && correspondeCategoria;

                card.classList.toggle("filtro-oculto", !visivel);
                if (visivel) encontrados++;
            });
        });

        contador.textContent = encontrados === 0
            ? "Nenhum produto encontrado. Tente outro nome ou categoria."
            : encontrados + (encontrados === 1 ? " produto encontrado." : " produtos encontrados.") +
              " de " + total + " disponíveis.";

        window.dispatchEvent(new Event("filtros-alterados"));
    }

    busca.addEventListener("input", aplicarFiltros);
    categoria.addEventListener("change", aplicarFiltros);
    window.addEventListener("produtos-atualizados", aplicarFiltros);

    secoes.forEach(secao => {
        new MutationObserver(aplicarFiltros).observe(secao, {
            childList: true,
            subtree: true
        });
    });

    aplicarFiltros();
})();