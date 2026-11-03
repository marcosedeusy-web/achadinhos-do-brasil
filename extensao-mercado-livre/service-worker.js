const ML_TAGS = "https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/tags";
const ML_LINKS = "https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/links";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "ACHADINHOS_GERAR_LINKS") return;
  (async () => {
    const tagsResponse = await fetch(ML_TAGS, {
      method: "GET",
      credentials: "include",
      headers: { "Accept": "application/json" }
    });
    if (tagsResponse.status === 401 || tagsResponse.status === 403) {
      throw new Error("Sua sessão de afiliado expirou. Entre novamente no Mercado Livre e tente outra vez.");
    }
    if (!tagsResponse.ok) throw new Error("O Mercado Livre não respondeu ao consultar sua etiqueta de afiliado.");
    const tagsData = await tagsResponse.json();
    const tag = (tagsData.tags || []).find(item => item.in_use)?.tag;
    if (!tag) throw new Error("Não encontrei uma etiqueta ativa na sua conta de afiliado.");

    const urls = [...new Set((message.urls || []).filter(url => typeof url === "string"))];
    const results = [];
    for (let i = 0; i < urls.length; i++) {
      const response = await fetch(ML_LINKS, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ url: urls[i], tag })
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error("A sessão do Mercado Livre expirou durante a geração dos links. Entre novamente e repita.");
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.short_url) {
        results.push({ original: urls[i], error: data.message || data.error || "O Mercado Livre não gerou o link deste produto." });
      } else {
        results.push({ original: urls[i], affiliate: data.short_url });
      }
    }
    const successful = results.filter(item => item.affiliate);
    if (!successful.length) throw new Error("Nenhum link de afiliado foi gerado. Verifique se os anúncios estão elegíveis.");
    await chrome.storage.local.set({
      achadinhosPendingLinks: successful.map(item => item.affiliate),
      achadinhosLastReport: {
        total: urls.length,
        generated: successful.length,
        failed: results.length - successful.length,
        failures: results.filter(item => item.error).slice(0, 10)
      }
    });
    sendResponse({ ok: true, report: { total: urls.length, generated: successful.length, failed: results.length - successful.length } });
  })().catch(error => sendResponse({ ok: false, error: error.message || "Falha inesperada." }));
  return true;
});