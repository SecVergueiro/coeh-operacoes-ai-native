"""Persistência em CSV com escrita atômica e deduplicação."""

from __future__ import annotations

import csv
import os
import tempfile
import threading
from pathlib import Path


EVENT_FIELDS = [
    "evento_id",
    "atendimento_id",
    "ocorrido_em",
    "autor",
    "tipo",
    "campo",
    "valor_anterior",
    "valor_novo",
    "motivo",
    "retorno_em",
    "idempotency_key",
]


class CsvRepository:
    def __init__(self, state_path: Path, history_path: Path, runtime_path: Path) -> None:
        self.state_path = state_path
        self.history_path = history_path
        self.runtime_path = runtime_path
        self._lock = threading.Lock()
        self._ensure_runtime_file()

    @staticmethod
    def _read(path: Path) -> list[dict[str, str]]:
        with path.open(encoding="utf-8", newline="") as file:
            return list(csv.DictReader(file))

    def _ensure_runtime_file(self) -> None:
        self.runtime_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.runtime_path.exists():
            with self.runtime_path.open("w", encoding="utf-8", newline="") as file:
                csv.DictWriter(file, fieldnames=EVENT_FIELDS).writeheader()

    def list_attendances(self) -> list[dict[str, str]]:
        return self._read(self.state_path)

    def list_events(self) -> list[dict[str, str]]:
        historical = self._read(self.history_path)
        runtime = self._read(self.runtime_path)
        return historical + runtime

    def list_runtime_events(self) -> list[dict[str, str]]:
        return self._read(self.runtime_path)

    def append_runtime_event(self, event: dict[str, str]) -> tuple[dict[str, str], bool]:
        with self._lock:
            events = self._read(self.runtime_path)
            existing = next(
                (item for item in events if item["idempotency_key"] == event["idempotency_key"]),
                None,
            )
            if existing:
                return existing, False

            event = dict(event)
            event["evento_id"] = f"EVT-{len(self._read(self.history_path)) + len(events) + 1:03d}"
            events.append(event)
            descriptor, temporary_name = tempfile.mkstemp(
                prefix="eventos-", suffix=".csv", dir=self.runtime_path.parent
            )
            os.close(descriptor)
            temporary = Path(temporary_name)
            try:
                with temporary.open("w", encoding="utf-8", newline="") as file:
                    writer = csv.DictWriter(file, fieldnames=EVENT_FIELDS)
                    writer.writeheader()
                    writer.writerows(events)
                    file.flush()
                    os.fsync(file.fileno())
                os.replace(temporary, self.runtime_path)
            finally:
                temporary.unlink(missing_ok=True)
            return event, True
