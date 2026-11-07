/* Contrato do painel com o servidor local. Nenhum estado é confirmado antes da resposta. */
(() => {
  "use strict";
  const statuses = new Set(["novo", "em_analise", "aguardando_cliente", "aguardando_interno", "retorno_agendado", "concluido", "cancelado", "sem_acao"]);
  const priorities = new Set(["P0", "P1", "P2", "P3"]);

  function normalizeState(payload) {
    if (!payload || !Array.isArray(payload.attendances) || !Array.isArray(payload.events) || !Number.isFinite(Date.parse(payload.generated_at))) {
      throw new Error("A resposta da fila está incompleta. Tente carregar novamente.");
    }
    const ids = new Set();
    for (const item of payload.attendances) {
      const fields = ["atendimento_id", "usuario", "resumo", "linhas_mensagem", "prioridade", "status"];
      if (!item || fields.some((field) => typeof item[field] !== "string") || !item.atendimento_id.startsWith("ATD-") || ids.has(item.atendimento_id) || !statuses.has(item.status) || !priorities.has(item.prioridade)) {
        throw new Error("Os dados recebidos da fila não puderam ser conferidos. Tente novamente.");
      }
      ids.add(item.atendimento_id);
    }
    for (const event of payload.events) {
      if (!event || typeof event.evento_id !== "string" || !ids.has(event.atendimento_id) || typeof event.motivo !== "string") {
        throw new Error("O histórico recebido está incompleto. Tente novamente.");
      }
    }
    return { gerado_em: payload.generated_at, fuso: payload.timezone, atendimentos: payload.attendances, eventos: payload.events };
  }

  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || "O servidor não confirmou a operação. Tente novamente.");
      return payload;
    } catch (error) {
      if (error.name === "AbortError" || error instanceof TypeError || error instanceof SyntaxError) {
        throw new Error("Não foi possível confirmar a resposta do servidor. Seus campos foram mantidos. Tente novamente.");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function prepare(command, previous = null) {
    const body = JSON.stringify(command);
    if (previous?.body === body) return previous;
    const key = window.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return Object.freeze({ body, key });
  }

  async function register(submission) {
    const payload = await request("/api/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": submission.key },
      body: submission.body,
    });
    if (typeof payload.created !== "boolean" || !payload.event?.evento_id) {
      throw new Error("O registro não pôde ser confirmado. Tente novamente com os mesmos campos.");
    }
    return { state: normalizeState(payload.state), created: payload.created };
  }

  window.COEH_API = Object.freeze({
    load: async () => normalizeState(await request("/api/v1/state", { headers: { Accept: "application/json" }, cache: "no-store" })),
    prepare,
    register,
  });
})();
