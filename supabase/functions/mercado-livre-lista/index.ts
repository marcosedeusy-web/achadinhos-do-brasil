// Edge Function: mercado-livre-lista
// Recebe a URL pública de uma lista social do Mercado Livre e tenta extrair
// os links de anúncios presentes no HTML público. Não cria links de afiliado.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/g, "/")
    .replace(/&#39;|&#x27;/gi, "'");
}

function normalizeUrl(raw: string): string | null {
  let value = decodeHtml(raw).replace(/\\u0026/g, "&").replace(/\\\//g, "/");
  value = value.replace(/^\\s*["']|["']\\s*$/g, "");
  if (value.startsWith("//")) value = "https:" + value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (!["mercadolivre.com.br", "www.mercadolivre.com.br", "meli.la"].includes(host)) return null;
    if (host === "meli.la") return url.toString();
    if (/\\/(?:social|lists?)(?:[/?#]|$)/i.test(url.pathname)) return null;
    if (!/(?:MLB-?\\d{6,}|\\/p\\/MLB)/i.test(url.pathname) &&
        !/mercadolivre\\.com\\.br\\/[^"'\\s]+/i.test(url.href)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractLinks(html: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /https?:\\\\?\\/\\\\?\\/[^"'\\s<>]+/gi,
    /https?:\\/\\/[^"'\\s<>]+/gi,
    /(?:href|url|permalink|item_url|itemUrl)\\s*[:=]\\s*["']([^"']+)["']/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const candidate = match[1] || match[0];
      const normalized = normalizeUrl(candidate);
      if (normalized) found.add(normalized);
    }
  }
  return [...found].slice(0, 150);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Use POST." }, 405);

  try {
    const body = await req.json();
    const input = String(body?.url || "").trim();
    if (!input) return json({ success: false, error: "Informe o link da lista." }, 400);

    let listUrl: URL;
    try {
      listUrl = new URL(input);
    } catch {
      return json({ success: false, error: "O endereço informado não é válido." }, 400);
    }

    if (listUrl.protocol !== "https:" ||
        !["meli.la", "www.mercadolivre.com.br", "mercadolivre.com.br"].includes(listUrl.hostname.toLowerCase())) {
      return json({ success: false, error: "Use um link HTTPS público do Mercado Livre." }, 400);
    }

    const response = await fetch(listUrl.toString(), {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AchadinhosImport/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      signal: AbortSignal.timeout(18000),
    });

    if (!response.ok) {
      return json({
        success: false,
        error: `O Mercado Livre bloqueou ou recusou a leitura da lista (HTTP ${response.status}).`,
      }, 502);
    }

    const finalHost = new URL(response.url).hostname.toLowerCase();
    if (!["mercadolivre.com.br", "www.mercadolivre.com.br"].includes(finalHost)) {
      return json({ success: false, error: "O link redirecionou para um domínio inesperado." }, 400);
    }

    const html = await response.text();
    const links = extractLinks(html);
    if (!links.length) {
      return json({
        success: false,
        error: "A página abriu, mas não expôs os links dos produtos no HTML público. O Mercado Livre pode carregar a lista somente pelo aplicativo ou bloquear a leitura automática.",
        total: 0,
        produtos: [],
      });
    }

    return json({
      success: true,
      total: links.length,
      produtos: links.map((url) => ({ url })),
      aviso: "Foram extraídos links públicos. Confirme cada link de afiliado antes de cadastrar; esta função não cria nem garante rastreamento de comissão.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada ao ler a lista.";
    return json({ success: false, error: message }, 500);
  }
});
