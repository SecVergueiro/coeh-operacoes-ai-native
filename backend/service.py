"""Casos de uso da fila operacional."""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from .domain import DomainError, EventCommand, apply_runtime_event
from .repository import CsvRepository


TIMEZONE = ZoneInfo("America/Sao_Paulo")


class QueueService:
    def __init__(self, repository: CsvRepository) -> None:
        self.repository = repository

    def get_state(self) -> dict[str, object]:
        attendances = self.repository.list_attendances()
        runtime_events = self.repository.list_runtime_events()
        by_id = {item["atendimento_id"]: item for item in attendances}
        for event in runtime_events:
            attendance_id = event["atendimento_id"]
            if attendance_id in by_id:
                by_id[attendance_id] = apply_runtime_event(by_id[attendance_id], event)

        priority_rank = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
        ordered = sorted(
            by_id.values(),
            key=lambda item: (priority_rank[item["prioridade"]], int(item["ordem"])),
        )
        for position, item in enumerate(ordered, start=1):
            item["ordem"] = str(position)
        return {
            "generated_at": "2026-11-05T16:00:00-03:00",
            "timezone": "America/Sao_Paulo",
            "attendances": ordered,
            "events": self.repository.list_events(),
            "runtime_event_count": len(runtime_events),
        }

    def register_event(
        self, command: EventCommand, idempotency_key: str
    ) -> tuple[dict[str, str], bool, dict[str, object]]:
        if len(idempotency_key) < 8 or len(idempotency_key) > 120:
            raise DomainError(
                "invalid_idempotency_key",
                "A chave de idempotência deve ter entre 8 e 120 caracteres.",
                400,
            )

        state = self.get_state()
        attendance = next(
            (item for item in state["attendances"] if item["atendimento_id"] == command.attendance_id),
            None,
        )
        if attendance is None:
            raise DomainError("attendance_not_found", "Atendimento não encontrado.", 404)

        field, new_value = self._event_change(command)
        event = {
            "evento_id": "",
            "atendimento_id": command.attendance_id,
            "ocorrido_em": datetime.now(TIMEZONE).isoformat(timespec="seconds"),
            "autor": command.author,
            "tipo": command.event_type,
            "campo": field,
            "valor_anterior": attendance.get(field, ""),
            "valor_novo": new_value,
            "motivo": command.reason,
            "retorno_em": command.return_at or "",
            "idempotency_key": idempotency_key,
        }
        saved, created = self.repository.append_runtime_event(event)
        return saved, created, self.get_state()

    @staticmethod
    def _event_change(command: EventCommand) -> tuple[str, str]:
        if command.event_type == "correcao_prioridade":
            return "prioridade", command.priority or ""
        if command.event_type == "aguardar_informacao":
            return "status", "aguardando_cliente"
        if command.event_type == "assumir":
            return "responsavel", command.author
        if command.event_type == "andamento":
            return "ultimo_registro", command.reason
        if command.event_type == "dependencia_interna":
            return "status", "aguardando_interno"
        return "status", "concluido"
