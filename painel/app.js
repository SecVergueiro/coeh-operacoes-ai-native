(() => {
  "use strict";
  // O servidor confirma o estado; o snapshot permite leitura quando ele não está disponível.
  let data = structuredClone(window.COEH_DATA);
  let connection = "loading";
  let saving = false;
  let pendingSubmission = null;
  const source = window.COEH_MESSAGES || {};
  const active = new Set(["novo", "em_analise", "aguardando_cliente", "aguardando_interno", "retorno_agendado"]);
  const waiting = new Set(["aguardando_cliente", "aguardando_interno", "retorno_agendado"]);
  const closed = new Set(["concluido", "cancelado", "sem_acao"]);
  const labels = { novo:"Novo", em_analise:"Em análise", aguardando_cliente:"Aguardando cliente", aguardando_interno:"Aguardando equipe", retorno_agendado:"Retorno combinado", concluido:"Concluído", cancelado:"Cancelado", sem_acao:"Sem ação", emissao_nota:"Emissão de nota", guia_imposto:"Guia de imposto", cadastro_empresa:"Cadastro de empresa", alteracao_cadastral:"Alteração cadastral", cobranca_assinatura:"Cobrança de assinatura", cancelamento_assinatura:"Cancelamento de assinatura", encerramento_empresa:"Encerramento de empresa", documento_folha:"Documento de folha", declaracao_relatorio:"Declaração e relatório", comercial_migracao:"Comercial e migração", correcao_prioridade:"Prioridade corrigida", aguardar_informacao:"Informação solicitada", conclusao:"Conclusão registrada", assumir:"Atendimento assumido", andamento:"Andamento registrado", dependencia_interna:"Dependência interna registrada" };
  const priorities = {P0:"Agir agora",P1:"Em seguida",P2:"Planejar",P3:"Acompanhar"};
  const views = {active:"Em aberto",waiting:"Aguardando",closed:"Encerrados"};
  const state = {view:"active",priority:"all",query:"",selected:data.atendimentos[0]?.atendimento_id || null,tab:"overview"};
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const label = (value) => labels[value] || String(value || "Não informado").replaceAll("_"," ");
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const normalize = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const color = (name) => ["","violet","green","blue"][name.charCodeAt(0)%4];
  const itemById = (id) => data.atendimentos.find((item) => item.atendimento_id === id);
  let cutoff = new Date(data.gerado_em);
  let toastTimer;
  let actionId;

  function messages(item) {
    return item.linhas_mensagem.split("|").map((line) => ({line,cells:source[line]})).filter((entry) => entry.cells);
  }
  function excelDate(serial) {
    return new Date(Date.UTC(1899,11,30) + Math.round(Number(serial)*86400000));
  }
  function messageTime(serial) {
    return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(excelDate(serial));
  }
  function dateLabel(value) {
    if (!value) return "Sem prazo informado";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split("-").reverse().slice(0,2).join("/");
    return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}).format(new Date(value));
  }
  function overdue(item) {
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(item.prazo) ? `${item.prazo}T23:59:59-03:00` : item.prazo;
    return active.has(item.status) && deadline && new Date(deadline) < cutoff;
  }
  function deadlineLabel(item) {
    if (overdue(item)) return `Prazo vencido · ${dateLabel(item.prazo)}`;
    if (item.prazo?.startsWith("2026-11-05")) return `Hoje, ${item.prazo.length > 10 ? dateLabel(item.prazo).split(", ")[1] : "até o fim do dia"}`;
    return item.prazo ? `Prazo ${dateLabel(item.prazo)}` : "Sem prazo informado";
  }
  function inView(item) {
    return state.view === "waiting" ? waiting.has(item.status) : state.view === "closed" ? closed.has(item.status) : active.has(item.status);
  }
  function visibleItems() {
    return data.atendimentos.filter((item) => inView(item) && (state.priority === "all" || (state.priority === "other" ? item.prioridade !== "P0" : item.prioridade === state.priority)) && normalize([item.usuario,item.empresa,item.resumo,item.atendimento_id,item.categoria,label(item.categoria)].join(" ")).includes(normalize(state.query)));
  }
  function renderQueue() {
    const items = visibleItems();
    $("#count-active").textContent = data.atendimentos.filter((item) => active.has(item.status)).length;
    $("#count-waiting").textContent = data.atendimentos.filter((item) => waiting.has(item.status)).length;
    $("#count-closed").textContent = data.atendimentos.filter((item) => closed.has(item.status)).length;
    $("#queue-title").firstChild.textContent = `${views[state.view]} `;
    $("#queue-count").textContent = items.length;
    $("#queue-description").textContent = state.view === "waiting" ? "Dependências e retornos para acompanhar" : state.view === "closed" ? "Conclusões, cancelamentos e orientações" : "Organizados por prioridade";
    $("#urgent-count").textContent = data.atendimentos.filter((item) => inView(item) && item.prioridade === "P0").length;
    $("#queue-empty").hidden = items.length !== 0;
    $("#queue-list").hidden = items.length === 0;
    $("#queue-list").innerHTML = items.map((item) => `<button class="ticket-row" data-id="${esc(item.atendimento_id)}" aria-pressed="${state.selected === item.atendimento_id}" aria-label="Abrir atendimento de ${esc(item.usuario)}: ${esc(item.resumo)}">
      <span class="row-heading"><span class="avatar ${color(item.usuario)}" aria-hidden="true">${esc(item.usuario[0])}</span><span><span class="row-person">${esc(item.usuario)}</span><span class="row-company">${esc(item.empresa || "Empresa não informada")}</span></span><span class="row-priority ${esc(item.prioridade)}">${esc(item.prioridade)}</span></span>
      <span class="row-summary">${esc(item.resumo)}</span><span class="row-meta"><span class="row-date ${overdue(item)?"overdue":""}">${esc(deadlineLabel(item))}</span><span class="row-state">${esc(label(item.status))}</span></span></button>`).join("");
    document.querySelectorAll("[data-view]").forEach((button) => {
      if (button.dataset.view === state.view) button.setAttribute("aria-current","page"); else button.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-priority]").forEach((button) => button.setAttribute("aria-pressed",String(button.dataset.priority === state.priority)));
  }
  function messageCard(entry) {
    return `<article class="latest-message"><div class="message-meta"><strong>${esc(entry.cells[1])}</strong><span>${esc(messageTime(entry.cells[0]))}</span></div><p class="message-text">${esc(entry.cells[2])}</p><small class="message-ref">Mensagem original · linha ${esc(entry.line)}</small></article>`;
  }
  function renderTicket() {
    const item = itemById(state.selected);
    if (!item) { $("#ticket").innerHTML = `<div class="ticket-empty">${icon("inbox")}<h2>Escolha um atendimento</h2><p>Abra um pedido da fila para conferir as mensagens e registrar o próximo passo.</p></div>`; return; }
    const history = data.eventos.filter((event) => event.atendimento_id === item.atendimento_id);
    const entries = messages(item);
    const isClosed = closed.has(item.status);
    $("#ticket").innerHTML = `<div class="ticket-top"><button class="icon-button back-to-list" id="back-to-list" aria-label="Voltar para a fila">${icon("back")}</button><span class="avatar ${color(item.usuario)}">${esc(item.usuario[0])}</span><div class="ticket-person">${esc(item.usuario)}<small>${esc(item.empresa || "Empresa não informada")}</small></div><div class="ticket-top-actions"><span class="ticket-state ${isClosed?"closed":""}">${esc(label(item.status))}</span>${!isClosed?`<button class="button secondary" data-action="assumir">${icon("user")}${item.responsavel?"Responsável":"Assumir"}</button>`:""}</div></div>
      <div class="ticket-scroll"><div class="ticket-intro"><span class="ticket-id">${esc(item.atendimento_id)} / ${esc(label(item.categoria))}</span><h2>${esc(item.resumo)}</h2>
      <dl class="ticket-facts"><div class="fact"><dt>Prioridade</dt><dd><button class="priority-edit ${esc(item.prioridade)}" data-action="correcao_prioridade" aria-label="Revisar prioridade de ${esc(item.usuario)}">${esc(item.prioridade)} · ${esc(priorities[item.prioridade])}</button></dd></div><div class="fact"><dt>Prazo do cliente</dt><dd class="${overdue(item)?"urgent-date":""}">${esc(dateLabel(item.prazo))}${overdue(item)?"<br>Prazo vencido":""}</dd></div><div class="fact"><dt>Responsável</dt><dd class="${item.responsavel?"":"unassigned"}">${esc(item.responsavel || "Ainda não atribuído")}</dd></div></dl></div>
      <div class="detail-tabs" role="tablist" aria-label="Conteúdo do atendimento"><button role="tab" id="tab-overview" data-tab="overview" aria-controls="tab-content" aria-selected="${state.tab === "overview"}" tabindex="${state.tab === "overview"?0:-1}">Visão geral</button><button role="tab" id="tab-messages" data-tab="messages" aria-controls="tab-content" aria-selected="${state.tab === "messages"}" tabindex="${state.tab === "messages"?0:-1}">Mensagens <span>${entries.length}</span></button><button role="tab" id="tab-history" data-tab="history" aria-controls="tab-content" aria-selected="${state.tab === "history"}" tabindex="${state.tab === "history"?0:-1}">Histórico <span>${history.length}</span></button></div>
      <div class="tab-content" id="tab-content" role="tabpanel" aria-labelledby="tab-${state.tab}">${tabContent(item, entries, history)}</div></div>
      <footer class="ticket-footer"><div class="footer-actions">${!isClosed?`<button class="button primary" data-action="andamento" aria-label="Registrar andamento">${icon("message")}<span class="action-long">Registrar andamento</span><span class="action-short">Registrar</span></button><button class="button secondary" data-action="aguardar_informacao">${icon("clock")}Aguardar</button><button class="button tertiary" data-action="conclusao">${icon("check")}Concluir</button>`:`<span class="history-empty">Este pedido está ${esc(label(item.status).toLowerCase())}. O histórico foi preservado.</span>`}</div><p>Registre somente as ações confirmadas pela operação.</p></footer>`;
  }
  function tabContent(item, entries, history) {
    if (state.tab === "messages") return `<div class="all-messages">${entries.map(messageCard).join("") || '<p class="history-empty">Consulte a planilha original para este atendimento.</p>'}</div>`;
    if (state.tab === "history") return history.length ? history.map((event) => `<article class="history-item"><h3>${esc(label(event.tipo))}</h3><p>${esc(event.motivo)}</p><small>${esc(event.autor)} · ${esc(dateLabel(event.ocorrido_em))}${event.idempotency_key?" · Registro da operação":" · Evento simulado do desafio"}</small>${event.retorno_em?`<small>Retorno: ${esc(dateLabel(event.retorno_em))} (Brasília)</small>`:""}</article>`).join("") : '<p class="history-empty">Nenhuma ação humana registrada neste atendimento. Ao registrar o andamento, ele aparece aqui com autor e motivo.</p>';
    return `<section class="next-action"><div class="next-action-heading">${icon("arrow")}Próxima ação sugerida</div><p>${esc(item.proximo_passo)}</p><small class="suggestion-note">Sugestão de IA salva na análise. A operação revisa antes de executar.</small><button class="ai-explainer-link" data-show-ai>Como a IA participa ${icon("info")}</button></section>
      <section class="content-section"><h3>Impacto relatado pelo cliente</h3><p class="impact-copy">${esc(item.impacto || "Impacto não informado nas mensagens.")}</p></section>
      ${item.retorno_em?`<section class="content-section"><h3>Retorno combinado</h3><p class="impact-copy">${esc(dateLabel(item.retorno_em))}, horário de Brasília. O prazo original do cliente foi mantido.</p></section>`:""}
      ${item.ultimo_registro?`<section class="content-section"><h3>Último andamento</h3><p class="impact-copy">${esc(item.ultimo_registro)}</p></section>`:""}
      ${entries.length?`<section class="content-section"><h3>Última mensagem recebida</h3>${messageCard(entries.at(-1))}<button class="source-action" data-show-messages>Ver as ${entries.length} mensagens ${icon("arrow")}</button></section>`:""}
      ${item.revisao_necessaria === "sim"?`<div class="review-note">${icon("alert")}Este pedido precisa de revisão humana. Confira a regra ou informação ausente antes de decidir.</div>`:""}`;
  }
  function syncAccess() {
    document.querySelectorAll('#ticket [data-action]').forEach((button) => { button.disabled = connection !== "ready" || saving; });
    $("#refresh-state").disabled = connection === "loading" || saving;
    $("#connection-label").dataset.mode = connection;
    $("#connection-label").textContent = connection === "ready" ? "Registros salvos" : connection === "loading" ? "Carregando registros…" : "Somente leitura";
  }
  async function loadState() {
    if (location.protocol === "file:") {
      connection = "readonly";
      $("#connection-message").textContent = "Você está vendo uma cópia da demonstração. Abra pelo servidor local para registrar o andamento.";
      $("#connection-banner").hidden = false; $("#retry-state").hidden = true;
      $("#refresh-state").hidden = true; syncAccess(); return;
    }
    connection = "loading"; syncAccess();
    try {
      data = await window.COEH_API.load();
      cutoff = new Date(data.gerado_em);
      connection = "ready"; $("#connection-banner").hidden = true;
      if (!itemById(state.selected)) state.selected = visibleItems()[0]?.atendimento_id || null;
      render();
    } catch (error) {
      connection = "readonly";
      $("#connection-message").textContent = "Não foi possível carregar os registros atuais. A fila exibida está disponível somente para consulta.";
      $("#connection-banner").hidden = false; render();
    }
  }
  function render() { renderQueue(); renderTicket(); syncAccess(); }
  function select(id) {
    state.selected = id; state.tab = "overview";
    render(); $("#inbox").classList.add("detail-open");
    if (matchMedia("(max-width: 980px)").matches) $("#back-to-list").focus();
  }
  function setTab(tab, focus = false) {
    state.tab = tab; renderTicket(); syncAccess();
    if (focus) $(`#tab-${tab}`).focus();
  }
  function showToast(text) {
    clearTimeout(toastTimer); $("#toast span").textContent = text; $("#toast").hidden = false;
    toastTimer = setTimeout(() => {$("#toast").hidden=true;},4500);
  }
  function updateActionForm() {
    const type = $("#event-type").value;
    $("#priority-field").hidden = type !== "correcao_prioridade";
    $("#return-field").hidden = !["andamento","aguardar_informacao","dependencia_interna"].includes(type);
    $("#reason-label").textContent = type === "conclusao" ? "O que confirma a conclusão?" : type === "assumir" ? "Como você vai dar sequência?" : type === "correcao_prioridade" ? "Por que a prioridade deve mudar?" : "O que foi feito ou o que está faltando?";
    $("#save-record").textContent = type === "conclusao" ? "Confirmar conclusão" : "Salvar registro";
    $("#action-title").textContent = {andamento:"Registrar andamento",assumir:"Assumir atendimento",aguardar_informacao:"Aguardar informação",dependencia_interna:"Aguardar equipe",correcao_prioridade:"Corrigir prioridade",conclusao:"Concluir atendimento"}[type];
  }
  function openAction(type) {
    const item = itemById(state.selected); if (!item || connection !== "ready" || saving) return;
    actionId = item.atendimento_id;
    $("#action-form").reset(); $("#form-error").hidden = true;
    if (pendingSubmission && JSON.parse(pendingSubmission.body).attendance_id !== item.atendimento_id) pendingSubmission = null;
    $("#event-type").value = type; $("#new-priority").value=item.prioridade;
    $("#author").value = item.responsavel || "";
    $("#action-context").textContent = `${item.usuario} / ${item.atendimento_id}`;
    updateActionForm(); $("#action-dialog").showModal();
    $("#author").focus();
  }
  const mobileNav = matchMedia("(max-width: 650px)");
  function closeNav() { $("#sidebar").classList.remove("is-open"); $("#sidebar").inert=mobileNav.matches; $("#nav-scrim").hidden=true; $("#open-nav").setAttribute("aria-expanded","false"); }
  function showInfo(guide = false) {
    $("#info-title").textContent = guide ? "Como a fila é priorizada" : "Como a IA participa";
    $("#info-content").innerHTML = guide ? '<p>A ordem considera o corte de 05/11/2026 às 16h, em Brasília.</p><h3>P0 · Agir agora</h3><p>Prazo vencido, compromisso descumprido ou impacto imediato.</p><h3>P1 · Em seguida</h3><p>Prazo próximo ou risco concreto de bloqueio.</p><h3>P2 · Planejar</h3><p>Pendência acionável, sem bloqueio imediato.</p><h3>P3 · Acompanhar</h3><p>Prazo distante, dependência ou pedido encerrado.</p><p>A prioridade é revisável. Abra um pedido e clique na prioridade para registrar uma correção.</p>' : `
      <p>O fluxo AI-native combina interpretação pela IA e acompanhamento humano. Cada rodada começa com as mensagens, o estado dos pedidos e as decisões anteriores.</p>
      <ol class="ai-flow">
        <li><h3>A IA recebe o contexto</h3><p>Uma sessão de IA lê as instruções do repositório, os atendimentos existentes, as mensagens novas e o histórico humano.</p></li>
        <li><h3>A IA propõe a organização</h3><p>Agrupa mensagens relacionadas, separa pedidos diferentes e sugere prioridade, próximo passo e dúvidas.</p></li>
        <li><h3>A operação revisa e registra</h3><p>Você confere as evidências, corrige interpretações, executa as ações e registra o andamento neste painel.</p></li>
        <li><h3>A próxima rodada usa as correções</h3><p>Uma nova sessão de IA deve ler os registros salvos e propor atualizações sem apagar as decisões anteriores.</p></li>
      </ol>
      <div class="ai-scope"><h3>O que acontece nesta demonstração</h3><p>As classificações e sugestões exibidas são resultados salvos da análise. O painel não gera respostas nem reclassifica pedidos automaticamente. A interpretação de mensagens novas acontece na sessão de IA que usa o repositório.</p></div>
      <p>As instruções de entrada estão em <code>AGENTS.md</code>; os prompts e o procedimento de continuidade também estão no repositório. Os registros feitos aqui ficam salvos no histórico; os três eventos iniciais são simulados para o desafio.</p>`;
    $("#info-dialog").showModal();
  }

  $("#queue-list").addEventListener("click", (event) => {const row=event.target.closest("[data-id]"); if(row) select(row.dataset.id);});
  $("#search").addEventListener("input", (event) => {state.query=event.target.value; renderQueue(); if(!visibleItems().some((item)=>item.atendimento_id===state.selected)){state.selected=visibleItems()[0]?.atendimento_id || null;state.tab="overview";renderTicket(); syncAccess();}});
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
    state.view=button.dataset.view;state.priority="all";state.query="";$("#search").value="";
    state.selected=visibleItems()[0]?.atendimento_id || null;state.tab="overview";
    $("#inbox").classList.remove("detail-open");closeNav();render();
  }));
  document.querySelectorAll("[data-priority]").forEach((button) => button.addEventListener("click", () => {
    state.priority=button.dataset.priority;
    if(!visibleItems().some((item)=>item.atendimento_id===state.selected)){state.selected=visibleItems()[0]?.atendimento_id || null;state.tab="overview";}
    render();
  }));
  $("#clear-search").addEventListener("click",()=>{state.query="";state.priority="all";$("#search").value="";state.selected=visibleItems()[0]?.atendimento_id || null;render();$("#search").focus();});
  $("#ticket").addEventListener("click", (event) => {
    const action=event.target.closest("[data-action]"); if(action){openAction(action.dataset.action);return;}
    const tab=event.target.closest("[data-tab]");if(tab){setTab(tab.dataset.tab,true);return;}
    if(event.target.closest("[data-show-ai]")){showInfo();return;}
    if(event.target.closest("[data-show-messages]")){setTab("messages",true);return;}
    if(event.target.closest("#back-to-list")){$("#inbox").classList.remove("detail-open");$(`[data-id="${state.selected}"]`)?.focus();}
  });
  $("#ticket").addEventListener("keydown", (event)=>{
    const tab=event.target.closest("[data-tab]");if(!tab)return;
    const tabs=["overview","messages","history"];let index=tabs.indexOf(state.tab);
    if(event.key==="ArrowRight") index=(index+1)%3;else if(event.key==="ArrowLeft")index=(index+2)%3;else if(event.key==="Home")index=0;else if(event.key==="End")index=2;else return;
    event.preventDefault();setTab(tabs[index],true);
  });
  $("#event-type").addEventListener("change",updateActionForm);
  document.querySelectorAll("[data-close-dialog]").forEach((button)=>button.addEventListener("click",()=>$("#action-dialog").close()));
  function setSaving(value) {
    saving = value;
    $("#action-form").setAttribute("aria-busy", String(value));
    $("#action-dialog").querySelectorAll("input, textarea, select, button").forEach((element) => { element.disabled = value; });
    syncAccess();
  }
  $("#action-dialog").addEventListener("cancel", (event) => { if (saving) event.preventDefault(); });
  $("#action-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saving || connection !== "ready") return;
    const author = $("#author").value.trim();
    const reason = $("#reason").value.trim();
    if (!author || author.length > 80 || reason.length < 10 || reason.length > 600) {
      $("#form-error").textContent = !author ? "Informe seu nome para identificar o responsável pelo registro." : author.length > 80 ? "Use até 80 caracteres no nome." : "Descreva o registro com 10 a 600 caracteres.";
      $("#form-error").hidden = false;
      (!author || author.length > 80 ? $("#author") : $("#reason")).focus();
      return;
    }
    const eventType = $("#event-type").value;
    const returnValue = !$("#return-field").hidden ? $("#return-at").value : "";
    if (returnValue && !$("#return-at").validity.valid) {
      $("#form-error").textContent = "Informe uma data e um horário de retorno válidos.";
      $("#form-error").hidden = false; $("#return-at").focus(); return;
    }
    const command = {
      attendance_id: actionId, event_type: eventType, author, reason,
      priority: eventType === "correcao_prioridade" ? $("#new-priority").value : null,
      return_at: returnValue ? returnValue + ":00-03:00" : null,
    };
    pendingSubmission = window.COEH_API.prepare(command, pendingSubmission);
    $("#form-error").hidden = true;
    setSaving(true); $("#save-record").textContent = "Salvando registro…";
    try {
      const result = await window.COEH_API.register(pendingSubmission);
      data = result.state; cutoff = new Date(data.gerado_em);
      pendingSubmission = null;
      $("#action-dialog").close(); state.tab = "history";
      render();
      showToast(result.created ? "Registro salvo no histórico." : "Esse registro já estava salvo. Histórico atualizado.");
      $("#tab-history")?.focus();
    } catch (error) {
      $("#form-error").textContent = error.message || "O registro não foi confirmado. Seus campos foram mantidos. Tente novamente.";
      $("#form-error").hidden = false;
      $("#form-error").setAttribute("tabindex", "-1");
    } finally {
      setSaving(false); updateActionForm();
      if (!$("#form-error").hidden) { $("#save-record").textContent = "Tentar salvar novamente"; $("#form-error").focus(); }
    }
  });
  $("#refresh-state").addEventListener("click", loadState);
  $("#retry-state").addEventListener("click", loadState);
  $("#about-button").addEventListener("click",()=>showInfo());
  $("#priority-guide").addEventListener("click",()=>showInfo(true));
  $("#close-info").addEventListener("click",()=>$("#info-dialog").close());
  $("#open-nav").setAttribute("aria-expanded","false");
  $("#open-nav").addEventListener("click",()=>{$("#sidebar").inert=false;$("#sidebar").classList.add("is-open");$("#nav-scrim").hidden=false;$("#open-nav").setAttribute("aria-expanded","true");$("#close-nav").focus();});
  $("#close-nav").addEventListener("click",()=>{closeNav();$("#open-nav").focus();});
  $("#nav-scrim").addEventListener("click",closeNav);
  document.addEventListener("keydown",(event)=>{if(event.key==="Escape" && $("#sidebar").classList.contains("is-open")){closeNav();$("#open-nav").focus();}});
  $("#sidebar").addEventListener("keydown",(event)=>{
    if(event.key!=="Tab" || !mobileNav.matches)return;
    const controls=[...$("#sidebar").querySelectorAll("button")].filter((el)=>el.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  });
  mobileNav.addEventListener("change",closeNav);
  closeNav();
  render();
  loadState();
})();
