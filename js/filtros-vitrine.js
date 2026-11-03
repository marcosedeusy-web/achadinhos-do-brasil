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
        .toLowerCase();

    function identificarCategoria(card) {
        return card.dataset.categoria || "outros";
    }

    function aplicarFiltros() {
        const termo = normalizar(busca.value.trim());
        const selecionada = categoria.value;
        let encontrados = 0;
        let total = 0;

        secoes.forEach(secao => {
            Array.from(secao.children).filter(card => card.classList.contains("produto")).forEach(card => {
                total++;
                const texto = normalizar(card.innerText || card.textContent);
                const correspondeTexto = !termo || texto.includes(termo);
                const correspondeCategoria = selecionada === "todos" || identificarCategoria(card) === selecionada;
                const visivel = correspondeTexto && correspondeCategoria;
                card.classList.toggle("filtro-oculto", !visivel);
                if (visivel) encontrados++;
            });
        });

        contador.textContent = encontrados === 0
            ? "Nenhum produto encontrado. Tente outro nome ou categoria."
            : encontrados + (encontrados === 1 ? " produto encontrado." : " produtos encontrados.") + " de " + total + " disponíveis.";
        window.dispatchEvent(new Event("filtros-alterados"));
    }

    busca.addEventListener("input", aplicarFiltros);
    categoria.addEventListener("change", aplicarFiltros);
    window.addEventListener("produtos-atualizados", aplicarFiltros);
    aplicarFiltros();
})();