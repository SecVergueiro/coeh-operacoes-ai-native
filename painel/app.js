(() => {
  "use strict";

  const snapshot = window.COEH_DATA;
  let data = snapshot;
  let apiAvailable = false;
  let noticeTimer = null;
  const activeStatuses = new Set(["novo", "em_analise", "aguardando_cliente", "aguardando_interno", "retorno_agendado"]);
  const closedStatuses = new Set(["concluido", "cancelado", "sem_acao"]);
  const state = { priority: "all", scope: "active", query: "", selectedId: null };
  const queueBody = document.querySelector("#queue-body");
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const detailPanel = document.querySelector("#detail-panel");
  const scrim = document.querySelector("#scrim");
  const search = document.querySelector("#search");
  const notice = document.querySelector("#notice");
  const modeIndicator = document.querySelector("#mode-indicator");

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const labels = { em_analise: "Em análise", novo: "Novo", concluido: "Concluído", cancelado: "Cancelado", sem_acao: "Sem ação", aguardando_cliente: "Aguardando cliente", aguardando_interno: "Aguardando equipe", retorno_agendado: "Retorno agendado", correcao_prioridade: "Correção de prioridade", aguardar_informacao: "Espera por informação", conclusao: "Conclusão", assumir: "Responsável definido", andamento: "Andamento", dependencia_interna: "Dependência interna" };
  const label = (value) => labels[value] || String(value || "não informado").replaceAll("_", " ");
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function normalizeApiState(payload) {
    return { gerado_em: payload.generated_at, fuso: payload.timezone, atendimentos: payload.attendances, eventos: payload.events };
  }

  async function loadData() {
    if (location.protocol === "file:") {
      modeIndicator.textContent = "Modo leitura · snapshot local";
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch("/api/v1/state", { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = normalizeApiState(await response.json());
      apiAvailable = true;
      modeIndicator.textContent = "Servidor ativo · decisões habilitadas";
    } catch (error) {
      data = snapshot;
      modeIndicator.textContent = "Modo degradado · snapshot local";
      showNotice("O servidor não respondeu. A fila continua disponível para leitura.", true);
    } finally {
      window.clearTimeout(timeout);
      renderAll();
    }
  }

  function renderAll() {
    renderMetrics();
    renderEvents();
    renderQueue();
  }

  function renderMetrics() {
    const active = data.atendimentos.filter((item) => activeStatuses.has(item.status));
    const metrics = [
      ["Mensagens", "96"],
      ["Atendimentos", String(data.atendimentos.length)],
      ["Ativos", String(active.length)],
      ["P0 + P1", String(active.filter((item) => item.prioridade === "P0" || item.prioridade === "P1").length)],
    ];
    document.querySelector("#metrics").innerHTML = metrics.map(([name, value]) => `<div class="metric"><dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  }

  function filteredItems() {
    return data.atendimentos.filter((item) => {
      const priorityMatches = state.priority === "all" || item.prioridade === state.priority;
      const scopeMatches = state.scope === "all" || (state.scope === "active" ? activeStatuses.has(item.status) : closedStatuses.has(item.status));
      const haystack = normalize([item.usuario, item.empresa, item.resumo, item.categoria, item.atendimento_id].join(" "));
      return priorityMatches && scopeMatches && haystack.includes(normalize(state.query));
    });
  }

  function deadline(value) {
    if (!value) return "Sem prazo definido";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Prazo inválido";
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(date);
  }

  function renderQueue() {
    const items = filteredItems();
    resultCount.textContent = `${items.length} ${items.length === 1 ? "atendimento exibido" : "atendimentos exibidos"}`;
    emptyState.hidden = items.length !== 0;
    queueBody.innerHTML = items.map((item) => `
      <tr tabindex="0" data-id="${escapeHtml(item.atendimento_id)}" data-selected="${state.selectedId === item.atendimento_id}">
        <td class="order">${escapeHtml(String(item.ordem).padStart(2, "0"))}</td>
        <td class="priority-cell"><span class="priority-mark priority-${escapeHtml(item.prioridade)}">${escapeHtml(item.prioridade)}</span></td>
        <td class="client"><strong>${escapeHtml(item.usuario)}</strong><span>${escapeHtml(item.empresa || "Empresa não informada")}</span></td>
        <td class="summary"><strong>${escapeHtml(item.resumo)}</strong><span>${escapeHtml(label(item.categoria))}</span></td>
        <td class="deadline">${escapeHtml(deadline(item.prazo))}</td>
        <td class="status">${escapeHtml(label(item.status))}</td>
        <td><button class="open-attendance" type="button" aria-label="Abrir atendimento de ${escapeHtml(item.usuario)}: ${escapeHtml(item.resumo)}">Abrir →</button></td>
      </tr>`).join("");
    queueBody.querySelectorAll("tr").forEach((row) => {
      const open = () => openDetails(row.dataset.id);
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => {
        if (event.target !== row) return;
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
    });
  }

  function renderEvents() {
    document.querySelector("#event-list").innerHTML = data.eventos.map((event) => `
      <li><span class="event-meta">${escapeHtml(event.evento_id)} · ${escapeHtml(event.atendimento_id)} · ${escapeHtml(formatEventTime(event.ocorrido_em))}</span>
      <span class="event-title">${escapeHtml(label(event.tipo))}: ${escapeHtml(label(event.valor_novo))}</span>
      <p class="event-reason">${escapeHtml(event.motivo)}</p></li>`).join("");
  }

  function formatEventTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "horário não informado";
    return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  }

  function openDetails(id) {
    const item = data.atendimentos.find((candidate) => candidate.atendimento_id === id);
    if (!item) return;
    state.selectedId = id;
    document.querySelector("#detail-id").textContent = `${item.atendimento_id} · ${item.prioridade}`;
    document.querySelector("#detail-title").textContent = item.resumo;
    document.querySelector("#detail-content").innerHTML = `
      <section class="detail-section"><div class="detail-grid">
        ${field("Cliente", item.usuario)}${field("Empresa", item.empresa || "Não informada")}${field("Categoria", label(item.categoria))}
        ${field("Situação", label(item.status))}${field("Prazo", deadline(item.prazo))}${field("Mensagens", item.linhas_mensagem.replaceAll("|", ", "))}
        ${field("Responsável", item.responsavel || "Não atribuído")}${field("Retorno combinado (Brasília)", item.retorno_em ? deadline(item.retorno_em) : "Não combinado")}
      </div></section>
      <section class="detail-section"><h3>Último registro operacional</h3><p class="detail-copy">${escapeHtml(item.ultimo_registro || "Nenhuma atualização manual nesta sessão.")}</p></section>
      <section class="detail-section"><h3>Impacto relatado</h3><p class="detail-copy">${escapeHtml(item.impacto)}</p></section>
      <section class="detail-section"><h3>Mensagens de origem</h3><p class="form-hint">Relatos do cliente; não comprovam execução. Referências à planilha recebida.</p>${item.linhas_mensagem.split("|").map((line) => {
        const cells = window.COEH_MESSAGES?.[line];
        return `<details><summary>Linha ${escapeHtml(line)} · ${escapeHtml(cells?.[1] || item.usuario)}</summary><p class="detail-copy">${escapeHtml(cells?.[2] || "Consulte a planilha original.")}</p></details>`;
      }).join("")}</section>
      <section class="detail-section next-step"><h3>1. Confira o próximo passo</h3><p class="detail-copy">${escapeHtml(item.proximo_passo)}</p><p class="form-hint">Sugestão da IA. Confirme as informações antes de executar.</p></section>
      <section class="detail-section"><h3>Revisão humana</h3><p class="detail-copy">${item.revisao_necessaria === "sim" ? "Necessária antes de decidir ou executar." : "Classificação com evidência suficiente; a execução ainda exige confirmação operacional."}</p></section>
      <section class="detail-section action-section"><h3>2. Registre o andamento</h3>${apiAvailable ? decisionForm(item) : '<p class="offline-note">Abra o painel pelo servidor local para registrar uma decisão. No modo arquivo, a demonstração é somente leitura.</p>'}</section>`;
    const content = document.querySelector("#detail-content");
    const secondSection = content.children[1];
    content.insertBefore(content.querySelector(".next-step"), secondSection);
    content.insertBefore(content.querySelector(".action-section"), secondSection);
    detailPanel.classList.add("is-open");
    detailPanel.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    renderQueue();
    if (apiAvailable) bindDecisionForm(item);
    document.querySelector("#close-detail").focus();
  }

  function field(name, value) {
    return `<div class="detail-field"><span>${escapeHtml(name)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function decisionForm(item) {
    return `<form class="decision-form" id="decision-form" novalidate>
      <label class="form-field"><span>O que você quer registrar?</span><select id="decision-type">
        <option value="assumir">Vou assumir este atendimento</option>
        <option value="andamento">Fiz uma ação e quero registrar</option>
        <option value="aguardar_informacao">Preciso de informação do cliente</option>
        <option value="dependencia_interna">Dependo de alguém da equipe</option>
        <option value="correcao_prioridade">Preciso corrigir a prioridade</option>
        <option value="conclusao">Confirmei a conclusão</option>
      </select></label>
      <div class="form-field" id="priority-field" hidden><span>Nova prioridade</span><div class="priority-options" aria-label="Nova prioridade">
        ${["P0", "P1", "P2", "P3"].map((priority) => `<button class="choice-button" type="button" data-new-priority="${priority}" aria-pressed="${item.prioridade === priority}">${priority}</button>`).join("")}
      </div></div>
      <label class="form-field" id="return-field" hidden><span>Retorno combinado, horário de Brasília</span><input id="return-at" type="datetime-local" /></label>
      <label class="form-field"><span>Seu nome</span><input id="event-author" name="author" value="operador" maxlength="80" autocomplete="name" /></label>
      <label class="form-field"><span>O que foi feito ou o que está faltando?</span><textarea id="event-reason" name="reason" minlength="10" maxlength="600" placeholder="Descreva a ação, a informação pendente ou o motivo da mudança." required></textarea></label>
      <p class="form-hint">A decisão será adicionada ao histórico. Nenhuma mensagem original será alterada.</p>
      <p class="form-error" id="form-error" role="alert" hidden></p>
      <button class="save-button" id="save-decision" type="submit">Salvar registro no histórico</button>
    </form>`;
  }

  function bindDecisionForm(item) {
    const form = document.querySelector("#decision-form");
    let eventType = "assumir";
    let priority = item.prioridade;
    let pendingKey = null;
    let pendingBody = null;
    form.querySelector("#decision-type").addEventListener("change", (event) => {
      eventType = event.target.value;
      document.querySelector("#priority-field").hidden = eventType !== "correcao_prioridade";
      document.querySelector("#return-field").hidden = !["aguardar_informacao", "dependencia_interna", "andamento"].includes(eventType);
    });
    form.querySelectorAll("[data-new-priority]").forEach((button) => button.addEventListener("click", () => {
      priority = button.dataset.newPriority;
      form.querySelectorAll("[data-new-priority]").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
    }));
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const reason = document.querySelector("#event-reason").value.trim();
      const author = document.querySelector("#event-author").value.trim() || "operador";
      const returnValue = document.querySelector("#return-at").value;
      const returnAt = returnValue ? `${returnValue}:00-03:00` : null;
      const errorElement = document.querySelector("#form-error");
      const saveButton = document.querySelector("#save-decision");
      if (reason.length < 10) {
        errorElement.textContent = "Explique o motivo com pelo menos 10 caracteres.";
        errorElement.hidden = false;
        document.querySelector("#event-reason").focus();
        return;
      }
      errorElement.hidden = true;
      saveButton.disabled = true;
      saveButton.textContent = "Registrando…";
      const body = JSON.stringify({ attendance_id: item.atendimento_id, event_type: eventType, reason, author, priority: eventType === "correcao_prioridade" ? priority : null, return_at: ["aguardar_informacao", "dependencia_interna", "andamento"].includes(eventType) ? returnAt : null });
      if (body !== pendingBody) { pendingKey = createIdempotencyKey(); pendingBody = body; }
      try {
        const response = await fetch("/api/v1/events", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": pendingKey },
          body,
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message || "Não foi possível registrar a decisão.");
        data = normalizeApiState(payload.state);
        renderAll();
        openDetails(item.atendimento_id);
        showNotice(payload.created ? "Decisão registrada no histórico." : "Essa decisão já havia sido registrada.");
      } catch (error) {
        errorElement.textContent = error.message || "Não foi possível registrar a decisão.";
        errorElement.hidden = false;
        saveButton.disabled = false;
        saveButton.textContent = "Tentar novamente";
      }
    });
  }

  function createIdempotencyKey() {
    return window.crypto?.randomUUID ? window.crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function showNotice(message, isError = false) {
    window.clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.classList.toggle("is-error", isError);
    notice.hidden = false;
    noticeTimer = window.setTimeout(() => { notice.hidden = true; }, 5000);
  }

  function closeDetails() {
    const selected = state.selectedId;
    state.selectedId = null;
    detailPanel.classList.remove("is-open");
    detailPanel.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    renderQueue();
    document.querySelector(`[data-id="${selected}"]`)?.focus();
  }

  function setButtonGroup(selector, attribute, value) {
    document.querySelectorAll(selector).forEach((button) => {
      const active = button.dataset[attribute] === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  document.querySelectorAll("[data-priority]").forEach((button) => button.addEventListener("click", () => { state.priority = button.dataset.priority; setButtonGroup("[data-priority]", "priority", state.priority); renderQueue(); }));
  document.querySelectorAll("[data-scope]").forEach((button) => button.addEventListener("click", () => { state.scope = button.dataset.scope; setButtonGroup("[data-scope]", "scope", state.scope); renderQueue(); }));
  search.addEventListener("input", () => { state.query = search.value; renderQueue(); });
  document.querySelector("#clear-filters").addEventListener("click", () => {
    state.priority = "all"; state.scope = "active"; state.query = ""; search.value = "";
    setButtonGroup("[data-priority]", "priority", "all"); setButtonGroup("[data-scope]", "scope", "active"); renderQueue();
  });
  document.querySelector("#close-detail").addEventListener("click", closeDetails);
  scrim.addEventListener("click", closeDetails);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.selectedId) closeDetails();
    if (event.key === "Tab" && state.selectedId) trapPanelFocus(event);
  });

  function trapPanelFocus(event) {
    const focusable = [...detailPanel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')].filter((element) => element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  renderAll();
  loadData();
})();
