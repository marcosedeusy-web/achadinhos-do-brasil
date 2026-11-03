const TAGS = "https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/tags";
const LINKS = "https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/links";
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "ACHADINHOS_GERAR_LINKS") return;
  (async () => {
    const tr = await fetch(TAGS, {credentials:"include", headers:{Accept:"application/json"}});
    if (tr.status === 401 || tr.status === 403) throw new Error("Entre novamente na sua conta de afiliado do Mercado Livre.");
    if (!tr.ok) throw new Error("Não foi possível consultar sua etiqueta de afiliado.");
    const tj = await tr.json();
    const tag = (tj.tags || []).find(t => t.in_use)?.tag;
    if (!tag) throw new Error("Não encontrei uma etiqueta ativa na sua conta.");
    const urls = [...new Set((msg.urls || []).filter(x => typeof x === "string"))];
    const links = [];
    for (const url of urls) {
      const r = await fetch(LINKS, {method:"POST", credentials:"include", headers:{"Content-Type":"application/json",Accept:"application/json"}, body:JSON.stringify({url,tag})});
      if (r.status === 401 || r.status === 403) throw new Error("Sua sessão expirou. Entre novamente e repita.");
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.short_url) links.push(j.short_url);
    }
    if (!links.length) throw new Error("Nenhum link foi gerado. Verifique a sessão e a elegibilidade dos anúncios.");
    await chrome.storage.local.set({achadinhosPendingLinks:links, achadinhosLastReport:{total:urls.length,generated:links.length,failed:urls.length-links.length}});
    sendResponse({ok:true,total:urls.length,generated:links.length,failed:urls.length-links.length});
  })().catch(e => sendResponse({ok:false,error:e.message || "Falha inesperada."}));
  return true;
});