(() => {
  "use strict";

  const data = window.COEH_DATA;
  const activeStatuses = new Set(["novo", "em_analise", "aguardando_cliente", "aguardando_interno", "retorno_agendado"]);
  const closedStatuses = new Set(["concluido", "cancelado", "sem_acao"]);
  const state = { priority: "all", scope: "active", query: "", selectedId: null };

  const queueBody = document.querySelector("#queue-body");
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const detailPanel = document.querySelector("#detail-panel");
  const scrim = document.querySelector("#scrim");
  const search = document.querySelector("#search");

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const label = (value) => String(value || "não informado").replaceAll("_", " ");
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function renderMetrics() {
    const active = data.atendimentos.filter((item) => activeStatuses.has(item.status));
    const metrics = [
      ["Mensagens", "96"],
      ["Atendimentos", String(data.atendimentos.length)],
      ["Ativos", String(active.length)],
      ["P0 + P1", String(active.filter((item) => item.prioridade === "P0" || item.prioridade === "P1").length)],
    ];
    document.querySelector("#metrics").innerHTML = metrics.map(([name, value]) => `
      <div class="metric"><dt>${name}</dt><dd>${value}</dd></div>
    `).join("");
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
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(date);
  }

  function renderQueue() {
    const items = filteredItems();
    resultCount.textContent = `${items.length} ${items.length === 1 ? "atendimento exibido" : "atendimentos exibidos"}`;
    emptyState.hidden = items.length !== 0;
    queueBody.innerHTML = items.map((item) => `
      <tr tabindex="0" data-id="${item.atendimento_id}" data-selected="${state.selectedId === item.atendimento_id}">
        <td class="order">${escapeHtml(String(item.ordem).padStart(2, "0"))}</td>
        <td class="priority-cell"><span class="priority-mark priority-${escapeHtml(item.prioridade)}">${escapeHtml(item.prioridade)}</span></td>
        <td class="client"><strong>${escapeHtml(item.usuario)}</strong><span>${escapeHtml(item.empresa || "Empresa não informada")}</span></td>
        <td class="summary"><strong>${escapeHtml(item.resumo)}</strong><span>${escapeHtml(label(item.categoria))}</span></td>
        <td class="deadline">${escapeHtml(deadline(item.prazo))}</td>
        <td class="status">${escapeHtml(label(item.status))}</td>
      </tr>
    `).join("");

    queueBody.querySelectorAll("tr").forEach((row) => {
      const open = () => openDetails(row.dataset.id);
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
  }

  function renderEvents() {
    document.querySelector("#event-list").innerHTML = data.eventos.map((event) => `
      <li>
        <span class="event-meta">${escapeHtml(event.evento_id)} · ${escapeHtml(event.atendimento_id)} · ${escapeHtml(new Date(event.ocorrido_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }))}</span>
        <span class="event-title">${escapeHtml(label(event.tipo))}: ${escapeHtml(label(event.valor_novo))}</span>
        <p class="event-reason">${escapeHtml(event.motivo)}</p>
      </li>
    `).join("");
  }

  function openDetails(id) {
    const item = data.atendimentos.find((candidate) => candidate.atendimento_id === id);
    if (!item) return;
    state.selectedId = id;
    document.querySelector("#detail-id").textContent = `${item.atendimento_id} · ${item.prioridade}`;
    document.querySelector("#detail-title").textContent = item.resumo;
    document.querySelector("#detail-content").innerHTML = `
      <section class="detail-section">
        <div class="detail-grid">
          ${field("Cliente", item.usuario)}
          ${field("Empresa", item.empresa || "Não informada")}
          ${field("Categoria", label(item.categoria))}
          ${field("Situação", label(item.status))}
          ${field("Prazo", deadline(item.prazo))}
          ${field("Mensagens", item.linhas_mensagem.replaceAll("|", ", "))}
        </div>
      </section>
      <section class="detail-section"><h3>Impacto relatado</h3><p class="detail-copy">${escapeHtml(item.impacto)}</p></section>
      <section class="detail-section"><h3>Próximo passo sugerido</h3><p class="detail-copy">${escapeHtml(item.proximo_passo)}</p></section>
      <section class="detail-section"><h3>Revisão humana</h3><p class="detail-copy">${item.revisao_necessaria === "sim" ? "Necessária antes de decidir ou executar." : "Classificação com evidência suficiente; a execução ainda exige confirmação operacional."}</p></section>
    `;
    detailPanel.classList.add("is-open");
    detailPanel.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    renderQueue();
    document.querySelector("#close-detail").focus();
  }

  function field(name, value) {
    return `<div class="detail-field"><span>${escapeHtml(name)}</span><strong>${escapeHtml(value)}</strong></div>`;
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

  document.querySelectorAll("[data-priority]").forEach((button) => button.addEventListener("click", () => {
    state.priority = button.dataset.priority;
    setButtonGroup("[data-priority]", "priority", state.priority);
    renderQueue();
  }));

  document.querySelectorAll("[data-scope]").forEach((button) => button.addEventListener("click", () => {
    state.scope = button.dataset.scope;
    setButtonGroup("[data-scope]", "scope", state.scope);
    renderQueue();
  }));

  search.addEventListener("input", () => { state.query = search.value; renderQueue(); });
  document.querySelector("#clear-filters").addEventListener("click", () => {
    state.priority = "all";
    state.scope = "active";
    state.query = "";
    search.value = "";
    setButtonGroup("[data-priority]", "priority", "all");
    setButtonGroup("[data-scope]", "scope", "active");
    renderQueue();
  });
  document.querySelector("#close-detail").addEventListener("click", closeDetails);
  scrim.addEventListener("click", closeDetails);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.selectedId) closeDetails();
  });

  renderMetrics();
  renderEvents();
  renderQueue();
})();
