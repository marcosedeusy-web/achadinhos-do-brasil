(() => {
    function configurarDescricao() {
        document.querySelectorAll(".produto .imagem-produto-link").forEach((imagem) => {
            if (imagem.dataset.descricaoConfigurada === "sim") return;
            imagem.dataset.descricaoConfigurada = "sim";
            const card = imagem.closest(".produto");
            if (!card) return;
            imagem.addEventListener("mouseenter", () => card.classList.add("descricao-visivel"));
            card.addEventListener("mouseleave", () => card.classList.remove("descricao-visivel"));
            imagem.addEventListener("focus", () => card.classList.add("descricao-visivel"));
            imagem.addEventListener("blur", () => card.classList.remove("descricao-visivel"));
        });
    }
    configurarDescricao();
    document.addEventListener("DOMContentLoaded", configurarDescricao);
    window.addEventListener("produtos-atualizados", configurarDescricao);
    new MutationObserver(configurarDescricao).observe(document.body, { childList: true, subtree: true });
})();