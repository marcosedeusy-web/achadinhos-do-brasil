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
  function reset(){form.reset();$("product-id").value="";$("ativo").checked=true;$("save-button").textContent="Salvar produto";$("cancel-button").hidden=true;}
  $("cancel-button").addEventListener("click",reset);
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(!currentUser||currentUser.id!==ADMIN_ID)return message("Acesso não autorizado.",true);
    const id=$("product-id").value;
    const row={nome:$("nome").value.trim(),descricao:$("descricao").value.trim(),preco:$("preco").value===""?null:Number($("preco").value),link_afiliado:$("link").value.trim(),plataforma:$("plataforma").value,ativo:$("ativo").checked};
    if(!/^https?:\/\//i.test(row.link_afiliado))return message("Informe um link de afiliado válido.",true);
    const file=$("imagem").files[0]; message("Salvando produto...");
    let oldImage=null;
    if(id){const old=await client.from("produtos").select("imagem_url").eq("id",id).single();if(old.error)return message("Erro ao localizar produto: "+old.error.message,true);oldImage=old.data.imagem_url;}
    if(file){
      const safe=file.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]/g,"-");
      const path=Date.now()+"-"+safe;
      const upload=await client.storage.from("produtos").upload(path,file,{upsert:false});
      if(upload.error)return message("Erro ao enviar imagem: "+upload.error.message,true);
      row.imagem_url=client.storage.from("produtos").getPublicUrl(path).data.publicUrl;
    } else if(!id) row.imagem_url=null;
    const saved=id?await client.from("produtos").update(row).eq("id",id):await client.from("produtos").insert(row);
    if(saved.error)return message("Erro ao salvar: "+saved.error.message,true);
    if(file&&oldImage){const marker="/storage/v1/object/public/produtos/";const at=oldImage.indexOf(marker);if(at>=0)await client.storage.from("produtos").remove([decodeURIComponent(oldImage.slice(at+marker.length))]);}
    reset();message("Produto salvo com sucesso.");loadProducts();
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
      edit.addEventListener("click",()=>{$("product-id").value=p.id;$("nome").value=p.nome||"";$("descricao").value=p.descricao||"";$("preco").value=p.preco??"";$("link").value=p.link_afiliado||"";$("plataforma").value=p.plataforma||"Shopee";$("ativo").checked=!!p.ativo;$("save-button").textContent="Atualizar produto";$("cancel-button").hidden=false;window.scrollTo({top:0,behavior:"smooth"});});
      const del=document.createElement("button");del.type="button";del.className="secundario";del.textContent="Excluir";
      del.addEventListener("click",async()=>{if(!confirm("Deseja excluir este produto?"))return;const r=await client.from("produtos").delete().eq("id",p.id);if(r.error)return message("Erro ao excluir: "+r.error.message,true);message("Produto excluído.");loadProducts();});
      actions.append(edit,del);card.append(img,info,actions);list.append(card);
    });
  }
  client.auth.getSession().then(({data})=>display(data.session?.user||null));
  client.auth.onAuthStateChange((_event,session)=>{if(!session){app.hidden=true;login.hidden=false;}});
})();