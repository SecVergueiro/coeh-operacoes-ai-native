"""Regras e validações do domínio operacional."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


PRIORITIES = {"P0", "P1", "P2", "P3"}
STATUSES = {
    "novo",
    "em_analise",
    "aguardando_cliente",
    "aguardando_interno",
    "retorno_agendado",
    "concluido",
    "cancelado",
    "sem_acao",
}
EVENT_TYPES = {"correcao_prioridade", "aguardar_informacao", "conclusao"}


class DomainError(Exception):
    def __init__(self, code: str, message: str, status: int = 422) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


@dataclass(frozen=True)
class EventCommand:
    attendance_id: str
    event_type: str
    reason: str
    author: str
    priority: str | None = None
    return_at: str | None = None


def parse_event_command(payload: dict[str, Any]) -> EventCommand:
    attendance_id = str(payload.get("attendance_id", "")).strip()
    event_type = str(payload.get("event_type", "")).strip()
    reason = str(payload.get("reason", "")).strip()
    author = str(payload.get("author", "operador")).strip() or "operador"
    priority = payload.get("priority")
    return_at = payload.get("return_at")

    if not attendance_id.startswith("ATD-"):
        raise DomainError("invalid_attendance_id", "Informe um atendimento válido.")
    if event_type not in EVENT_TYPES:
        raise DomainError("invalid_event_type", "Escolha um tipo de decisão válido.")
    if len(reason) < 10:
        raise DomainError("reason_too_short", "Explique o motivo com pelo menos 10 caracteres.")
    if len(reason) > 600:
        raise DomainError("reason_too_long", "O motivo deve ter no máximo 600 caracteres.")
    if len(author) > 80:
        raise DomainError("author_too_long", "O nome do responsável deve ter no máximo 80 caracteres.")

    if event_type == "correcao_prioridade":
        priority = str(priority or "").strip()
        if priority not in PRIORITIES:
            raise DomainError("invalid_priority", "Escolha uma prioridade entre P0 e P3.")
    else:
        priority = None

    if return_at:
        try:
            datetime.fromisoformat(str(return_at).replace("Z", "+00:00"))
        except ValueError as error:
            raise DomainError("invalid_return_at", "A data de retorno é inválida.") from error

    return EventCommand(
        attendance_id=attendance_id,
        event_type=event_type,
        reason=reason,
        author=author,
        priority=priority,
        return_at=str(return_at) if return_at else None,
    )


def apply_runtime_event(attendance: dict[str, str], event: dict[str, str]) -> dict[str, str]:
    updated = dict(attendance)
    event_type = event["tipo"]
    if event_type == "correcao_prioridade":
        updated["prioridade"] = event["valor_novo"]
    elif event_type == "aguardar_informacao":
        updated["status"] = "aguardando_cliente"
        if event.get("retorno_em"):
            updated["prazo"] = event["retorno_em"]
    elif event_type == "conclusao":
        updated["status"] = "concluido"
        updated["prioridade"] = "P3"
    return updated
