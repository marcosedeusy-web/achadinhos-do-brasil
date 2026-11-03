(() => {
  const admin = location.hostname === "marcosedeusy-web.github.io";
  if (document.getElementById("achadinhos-ml-helper")) return;
  const bar = document.createElement("div");
  bar.id = "achadinhos-ml-helper";
  bar.style.cssText = "position:fixed;z-index:2147483647;bottom:14px;right:14px;max-width:94vw;background:#14532d;color:white;padding:10px;border-radius:10px;box-shadow:0 4px 18px #0005;display:flex;gap:8px;align-items:center;flex-wrap:wrap;font:13px Arial";
  const status = document.createElement("span"); status.textContent = admin ? "Entre no painel e carregue os links." : "Importador pronto."; bar.append(status);
  const btn = (label, fn) => { const b=document.createElement("button"); b.textContent=label; b.style.cssText="border:0;border-radius:7px;padding:9px 12px;font:600 13px Arial;cursor:pointer;background:white;color:#14532d"; b.onclick=fn; bar.append(b); return b; };
  if (!admin) {
    btn("1. Capturar esta página", async () => {
      const urls = [...new Set([...document.querySelectorAll("a[href]")].map(a => {
        try {
          const u=new URL(a.href,location.href);
          if (!/(^|\.)mercadolivre\.com\.br$/i.test(u.hostname) || u.protocol!=="https:") return null;
          if (!(/\/p\/MLB\d{6,}|\/MLB-?\d{6,}/i.test(u.pathname) || /[?&]wid=MLB\d{6,}/i.test(u.href))) return null;
          u.hash=""; return u.toString();
        } catch { return null; }
      }).filter(Boolean))];
      if (!urls.length) { status.textContent="Nenhum anúncio encontrado nesta página. Aguarde carregar."; return; }
      const old=await chrome.storage.local.get("achadinhosCapturedUrls");
      const all=[...new Set([...(old.achadinhosCapturedUrls||[]),...urls])];
      await chrome.storage.local.set({achadinhosCapturedUrls:all});
      status.textContent=urls.length+" nesta página; "+all.length+" acumulados. Repita nas outras páginas.";
    });
    btn("Ver capturados", async () => { const x=await chrome.storage.local.get("achadinhosCapturedUrls"); status.textContent=(x.achadinhosCapturedUrls||[]).length+" links acumulados."; });
    const gen=btn("2. Gerar links e enviar", async () => {
      const x=await chrome.storage.local.get("achadinhosCapturedUrls"); const urls=x.achadinhosCapturedUrls||[];
      if (!urls.length) {status.textContent="Capture primeiro os produtos.";return;}
      gen.disabled=true; status.textContent="Gerando links de afiliado...";
      chrome.runtime.sendMessage({type:"ACHADINHOS_GERAR_LINKS",urls}, async r => {
        gen.disabled=false;
        if (chrome.runtime.lastError || !r?.ok) {status.textContent=r?.error||chrome.runtime.lastError?.message||"Falha ao gerar links.";return;}
        await chrome.storage.local.remove("achadinhosCapturedUrls");
        status.textContent=r.generated+" links gerados; "+r.failed+" falhas. Abrindo painel...";
        window.open("https://marcosedeusy-web.github.io/achadinhos-do-brasil/admin/","_blank");
      });
    });
    btn("Limpar", async () => {await chrome.storage.local.remove(["achadinhosCapturedUrls","achadinhosPendingLinks"]);status.textContent="Captura limpa.";});
  } else {
    btn("3. Carregar links no painel", async () => {
      const x=await chrome.storage.local.get(["achadinhosPendingLinks","achadinhosLastReport"]);
      const field=document.getElementById("lista-links-mercado-livre"), analyze=document.getElementById("analisar-lista-mercado-livre");
      if (!field || !analyze) {status.textContent="Faça login no painel e tente novamente.";return;}
      if (!(x.achadinhosPendingLinks||[]).length) {status.textContent="Nenhum link pendente. Capture os produtos no Mercado Livre.";return;}
      field.value=x.achadinhosPendingLinks.join("\n"); field.dispatchEvent(new Event("input",{bubbles:true})); analyze.click();
      status.textContent=x.achadinhosPendingLinks.length+" links enviados para análise. Confira a prévia e clique em Cadastrar selecionados.";
    });
  }
  document.documentElement.append(bar);
})();