(() => {
  const ADMIN_ID = "e949bda3-b00d-4989-976b-be8f8fdd2052";
  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  const $ = id => document.getElementById(id);
  let currentUser = null;
  const login = $("login-section"), app = $("app-section"), form = $("product-form");
  function message(text, error=false) { $("status").textContent=text; $("status").className=error?"status erro":"status sucesso"; }
  function display(user) {
    currentUser=user;
    const allowed=!!user && user.id===ADMIN_ID;
    login.hidden=allowed; app.hidden=!allowed;
    if(user&&!allowed){client.auth.signOut();message("Esta conta não está autorizada a administrar os produtos.",true);}
    if(allowed) loadProducts();
  }
  $("login-form").addEventListener("submit",async e=>{
    e.preventDefault(); message("Entrando...");
    const {data,error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
    if(error)return message("Não foi possível entrar: "+error.message,true);
    display(data.user);
  });
  $("logout-button").addEventListener("click",async()=>{await client.auth.signOut();currentUser=null;app.hidden=true;login.hidden=false;message("Você saiu do painel.");});
  function reset(){form.reset();$("product-id").value="";$("ativo").checked=true;$("save-button").textContent="Salvar produto";$("cancel-button").hidden=true;$("busca-status").textContent="Para anúncios com código MLB no link.";}
  $("colar-link").addEventListener("click", async () => {
    try {
      if(!navigator.clipboard || !navigator.clipboard.readText) throw new Error("Seu navegador não liberou o acesso à área de transferência.");
      const copied=await navigator.clipboard.readText();
      if(!copied.trim()) throw new Error("A área de transferência está vazia. Copie o link novamente.");
      $("link").value=copied.trim();
      $("link").dispatchEvent(new Event("input",{bubbles:true}));
      $("busca-status").textContent="Link colado. Agora você pode buscar os dados do anúncio.";
    } catch(error) {
      $("busca-status").textContent=(error.message||"Não foi possível ler o link.")+" Use Ctrl + V ou permita o acesso à área de transferência.";
    }
  });
  $("buscar-mercado-livre").addEventListener("click", async () => {
    const affiliateLink=$("link").value.trim();
    if(!affiliateLink) return $("busca-status").textContent="Cole primeiro seu link oficial de afiliado no campo próprio.";
    if($("plataforma").value!=="Mercado Livre") return $("busca-status").textContent="Selecione Mercado Livre para buscar os dados.";
    const lookupLink=affiliateLink;
    const button=$("buscar-mercado-livre");
    button.disabled=true;
    $("busca-status").textContent="Consultando os dados públicos do anúncio...";
    try {
      const {data,error}=await client.functions.invoke("mercado-livre-dados",{body:{url:lookupLink}});
      if(error) throw new Error(error.message||"Não foi possível chamar a função do Supabase.");
      if(!data?.success) throw new Error(data?.error||"O anúncio não forneceu dados públicos.");
      const item=data.data||{};
      if(item.nome) $("nome").value=item.nome;
      if(item.descricao) $("descricao").value=item.descricao;
      if(item.preco!=null) $("preco").value=Number(item.preco).toFixed(2);
      if(item.imagem) $("imagem-url").value=item.imagem;
      $("busca-status").textContent="Dados encontrados. Confira os campos antes de salvar. Seu link de afiliado foi preservado.";
    } catch(error) {
      $("busca-status").textContent=(error.message||"Falha na consulta.")+" O link de afiliado não foi alterado.";
    } finally {
      button.disabled=false;
    }
  });
  $("cancel-button").addEventListener("click",reset);
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(!currentUser||currentUser.id!==ADMIN_ID)return message("Acesso não autorizado.",true);
    const id=$("product-id").value;
    const row={nome:$("nome").value.trim(),descricao:$("descricao").value.trim(),preco:$("preco").value===""?null:Number($("preco").value),link_afiliado:$("link").value.trim(),plataforma:$("plataforma").value,ativo:$("ativo").checked};
    if(!/^https:\/\//i.test(row.link_afiliado))return message("Informe um link de afiliado seguro (https://).",true);
    const file=$("imagem").files[0];
    const imageUrl=$("imagem-url").value.trim();
    if(imageUrl && !/^https:\/\//i.test(imageUrl))return message("A URL da foto deve começar com https://.",true);
    if(file){
      const tiposPermitidos=["image/jpeg","image/png","image/webp","image/gif"];
      if(!tiposPermitidos.includes(file.type))return message("Formato de imagem não permitido. Use JPG, PNG, WEBP ou GIF.",true);
      if(file.size>5*1024*1024)return message("A imagem deve ter no máximo 5 MB.",true);
    }
    message("Salvando produto...");
    let oldImage=null;
    if(id){const old=await client.from("produtos").select("imagem_url").eq("id",id).single();if(old.error)return message("Erro ao localizar produto: "+old.error.message,true);oldImage=old.data.imagem_url;}
    if(file){
      const safe=file.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]/g,"-");
      const path=Date.now()+"-"+safe;
      const upload=await client.storage.from("produtos").upload(path,file,{upsert:false});
      if(upload.error)return message("Erro ao enviar imagem: "+upload.error.message,true);
      row.imagem_url=client.storage.from("produtos").getPublicUrl(path).data.publicUrl;
    } else if(imageUrl) row.imagem_url=imageUrl;
    else if(!id) row.imagem_url=null;
    const saved=id?await client.from("produtos").update(row).eq("id",id):await client.from("produtos").insert(row);
    if(saved.error)return message("Erro ao salvar: "+saved.error.message,true);
    if(file&&oldImage){const marker="/storage/v1/object/public/produtos/";const at=oldImage.indexOf(marker);if(at>=0)await client.storage.from("produtos").remove([decodeURIComponent(oldImage.slice(at+marker.length))]);}
    reset();message("Produto salvo com sucesso.");loadProducts();
  });

  $("import-old-products").addEventListener("click", async () => {
    if (!currentUser || currentUser.id !== ADMIN_ID) return message("Acesso não autorizado.", true);
    const antigos = [
      {nome:"Mini Power Bank Portátil",descricao:"Carregador portátil compacto. Confira as capacidades, cores e conexões disponíveis no anúncio.",preco:31.99,plataforma:"Shopee",link_afiliado:"https://s.shopee.com.br/30p7lRG6Ku",imagem_url:"https://marcosedeusy-web.github.io/achadinhos-do-brasil/imagens/foto1.jpg"},
      {nome:"Kit Body Splash Árabe Shakan",descricao:"Fragrâncias variadas em frascos de 60 ml. Confira as opções individuais e os kits disponíveis.",preco:14.89,plataforma:"Shopee",link_afiliado:"https://s.shopee.com.br/40hexzGWHO",imagem_url:"https://marcosedeusy-web.github.io/achadinhos-do-brasil/imagens/foto2.webp"},
      {nome:"Fone de Ouvido Bluetooth 760BT",descricao:"Fone sem fio com microfone, formato over-ear e diferentes opções de cores.",preco:38.55,plataforma:"Shopee",link_afiliado:"https://s.shopee.com.br/2gCHMwwXTq",imagem_url:"https://marcosedeusy-web.github.io/achadinhos-do-brasil/imagens/foto3.webp"},
      {nome:"Árvore de Natal 1,50 m — 400 Galhos",descricao:"Árvore verde desmontável para decorar casas, lojas e escritórios. Opções com pé de ferro ou plástico.",preco:79.99,plataforma:"Shopee",link_afiliado:"https://s.shopee.com.br/30p7lbUPuf",imagem_url:"https://marcosedeusy-web.github.io/achadinhos-do-brasil/imagens/foto4.jpg"},
      {nome:"Cartão de memória para armazenamento",descricao:"Uma opção para guardar fotos, vídeos e arquivos. Confira no anúncio a capacidade, a compatibilidade e a velocidade do modelo antes de comprar.",preco:null,plataforma:"Mercado Livre",link_afiliado:"https://meli.la/33aiKNy",imagem_url:"https://marcosedeusy-web.github.io/achadinhos-do-brasil/imagens/cartao4.webp"},
      {nome:"Escova para uso diário",descricao:"Confira no anúncio o tipo de escova, os materiais e a indicação de uso para escolher a opção adequada.",preco:null,plataforma:"Mercado Livre",link_afiliado:"https://meli.la/1zQtbNw",imagem_url:"https://marcosedeusy-web.github.io/achadinhos-do-brasil/imagens/escova5.webp"},
      {nome:"Fone de ouvido sem fio",descricao:"Ouça músicas e acompanhe chamadas sem a conexão de cabo. Consulte no anúncio a autonomia da bateria, a compatibilidade e os recursos do modelo.",preco:null,plataforma:"Mercado Livre",link_afiliado:"https://meli.la/1JUVTrJ",imagem_url:"https://marcosedeusy-web.github.io/achadinhos-do-brasil/imagens/fone6.webp"}
    ];
    const button = $("import-old-products");
    button.disabled = true;
    message("Verificando produtos antigos...");
    try {
      const existing = await client.from("produtos").select("link_afiliado");
      if (existing.error) throw existing.error;
      const links = new Set((existing.data || []).map(item => item.link_afiliado));
      const novos = antigos.filter(item => !links.has(item.link_afiliado)).map(item => ({...item, ativo:true}));
      if (!novos.length) {
        message("Os produtos antigos já estão todos cadastrados.");
      } else {
        const result = await client.from("produtos").insert(novos);
        if (result.error) throw result.error;
        message(novos.length + " produtos antigos importados com sucesso. Agora você pode editar ou excluir cada um.");
      }
      await loadProducts();
    } catch (error) {
      message("Não foi possível importar os produtos: " + (error.message || "erro desconhecido"), true);
    } finally {
      button.disabled = false;
    }
  });

  async function loadProducts(){
    const result=await client.from("produtos").select("*").order("criado_em",{ascending:false});
    if(result.error)return message("Erro ao carregar produtos: "+result.error.message,true);
    const list=$("products-list");list.replaceChildren();
    if(!result.data.length){list.textContent="Ainda não há produtos cadastrados.";return;}
    result.data.forEach(p=>{
      const card=document.createElement("article");card.className="produto";
      const img=document.createElement("img");img.src=p.imagem_url||"";img.alt=p.nome;
      const info=document.createElement("div"),title=document.createElement("h3"),desc=document.createElement("p");
      title.textContent=p.nome;desc.textContent=p.plataforma+" · "+(p.ativo?"Ativo":"Inativo")+(p.preco==null?"":" · R$ "+Number(p.preco).toFixed(2).replace(".",","));
      info.append(title,desc);
      const actions=document.createElement("div");actions.className="produto-acoes";
      const edit=document.createElement("button");edit.type="button";edit.textContent="Editar";
      edit.addEventListener("click",()=>{$("product-id").value=p.id;$("nome").value=p.nome||"";$("descricao").value=p.descricao||"";$("preco").value=p.preco??"";$("link").value=p.link_afiliado||"";$("plataforma").value=p.plataforma||"Shopee";$("ativo").checked=!!p.ativo;$("imagem-url").value=p.imagem_url||"";$("save-button").textContent="Atualizar produto";$("cancel-button").hidden=false;window.scrollTo({top:0,behavior:"smooth"});});
      const del=document.createElement("button");del.type="button";del.className="secundario";del.textContent="Excluir";
      del.addEventListener("click",async()=>{if(!confirm("Deseja excluir este produto?"))return;const r=await client.from("produtos").delete().eq("id",p.id);if(r.error)return message("Erro ao excluir: "+r.error.message,true);message("Produto excluído.");loadProducts();});
      actions.append(edit,del);card.append(img,info,actions);list.append(card);
    });
  }
  client.auth.getSession().then(({data})=>display(data.session?.user||null));
  client.auth.onAuthStateChange((_event,session)=>{if(!session){app.hidden=true;login.hidden=false;}});
})();
