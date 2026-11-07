from __future__ import annotations

import csv
import shutil
import tempfile
import unittest
from pathlib import Path

from backend.domain import DomainError, parse_event_command
from backend.repository import EVENT_FIELDS, CsvRepository
from backend.service import QueueService


ROOT = Path(__file__).resolve().parents[1]


class QueueServiceTest(unittest.TestCase):
    def test_ownership_progress_and_dependency_preserve_deadline(self) -> None:
        original = self.service.get_state()["attendances"][0]
        for index, event_type in enumerate(["assumir", "andamento", "dependencia_interna", "aguardar_informacao"]):
            command = parse_event_command({"attendance_id": original["atendimento_id"], "event_type": event_type, "reason": "Conferência feita; aguardamos documento do setor.", "author": "Isaque", "return_at": "2026-11-06T10:00:00-03:00"})
            _, _, state = self.service.register_event(command, f"workflow-key-{index}")
        item = next(row for row in state["attendances"] if row["atendimento_id"] == original["atendimento_id"])
        self.assertEqual(item["responsavel"], "Isaque")
        self.assertEqual(item["prazo"], original["prazo"])
        self.assertEqual(item["retorno_em"], "2026-11-06T10:00:00-03:00")
        self.assertEqual(item["status"], "aguardando_cliente")

    def setUp(self) -> None:
        work = ROOT / "work"
        work.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=work)
        base = Path(self.temp.name)
        state = base / "atendimentos.csv"
        history = base / "eventos.csv"
        runtime = base / "runtime.csv"
        shutil.copy2(ROOT / "dados" / "estado" / "atendimentos.csv", state)
        shutil.copy2(ROOT / "dados" / "eventos-manuais.csv", history)
        with runtime.open("w", encoding="utf-8", newline="") as file:
            csv.DictWriter(file, fieldnames=EVENT_FIELDS).writeheader()
        self.repository = CsvRepository(state, history, runtime)
        self.service = QueueService(self.repository)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_priority_correction_is_persisted_and_reorders_queue(self) -> None:
        command = parse_event_command({
            "attendance_id": "ATD-020",
            "event_type": "correcao_prioridade",
            "priority": "P0",
            "reason": "Novo prazo confirmado para atendimento imediato.",
            "author": "teste",
        })
        event, created, state = self.service.register_event(command, "test-key-priority")
        self.assertTrue(created)
        self.assertEqual(event["evento_id"], "EVT-004")
        attendance = next(item for item in state["attendances"] if item["atendimento_id"] == "ATD-020")
        self.assertEqual(attendance["prioridade"], "P0")
        self.assertLessEqual(int(attendance["ordem"]), 4)

    def test_same_idempotency_key_does_not_duplicate_event(self) -> None:
        command = parse_event_command({
            "attendance_id": "ATD-015",
            "event_type": "aguardar_informacao",
            "reason": "Aguardar documento alternativo solicitado ao cliente.",
            "author": "teste",
        })
        first, first_created, _ = self.service.register_event(command, "same-key-123")
        second, second_created, _ = self.service.register_event(command, "same-key-123")
        self.assertTrue(first_created)
        self.assertFalse(second_created)
        self.assertEqual(first["evento_id"], second["evento_id"])
        self.assertEqual(len(self.repository.list_runtime_events()), 1)

    def test_conclusion_moves_attendance_to_closed_state(self) -> None:
        command = parse_event_command({
            "attendance_id": "ATD-001",
            "event_type": "conclusao",
            "reason": "Atualização conferida no sistema e confirmada ao cliente.",
            "author": "teste",
        })
        _, _, state = self.service.register_event(command, "conclusion-key")
        attendance = next(item for item in state["attendances"] if item["atendimento_id"] == "ATD-001")
        self.assertEqual(attendance["status"], "concluido")
        self.assertEqual(attendance["prioridade"], "P3")

    def test_invalid_priority_is_rejected(self) -> None:
        with self.assertRaises(DomainError) as context:
            parse_event_command({
                "attendance_id": "ATD-001",
                "event_type": "correcao_prioridade",
                "priority": "urgente",
                "reason": "Prioridade inválida para o contrato da API.",
            })
        self.assertEqual(context.exception.code, "invalid_priority")

    def test_unknown_attendance_is_not_created_implicitly(self) -> None:
        command = parse_event_command({
            "attendance_id": "ATD-999",
            "event_type": "conclusao",
            "reason": "Este atendimento não existe no estado carregado.",
        })
        with self.assertRaises(DomainError) as context:
            self.service.register_event(command, "unknown-key")
        self.assertEqual(context.exception.status, 404)


if __name__ == "__main__":
    unittest.main()
