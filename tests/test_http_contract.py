from __future__ import annotations

import csv
import json
import shutil
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from backend.repository import EVENT_FIELDS, CsvRepository
from backend.server import AppHandler, create_server
from backend.service import QueueService


ROOT = Path(__file__).resolve().parents[1]


class HttpContractTest(unittest.TestCase):
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
        self.original_service = AppHandler.service
        AppHandler.service = QueueService(CsvRepository(state, history, runtime))
        AppHandler.quiet = True
        self.server = create_server(port=0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.server.server_port}"

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        AppHandler.service = self.original_service
        AppHandler.quiet = False
        self.temp.cleanup()

    def request(self, path: str, payload: dict[str, object], key: str) -> tuple[int, dict[str, object]]:
        request = urllib.request.Request(
            self.base_url + path,
            data=json.dumps(payload).encode("utf-8"),
            method="POST",
            headers={"Content-Type": "application/json", "Idempotency-Key": key},
        )
        try:
            with urllib.request.urlopen(request, timeout=2) as response:
                return response.status, json.loads(response.read())
        except urllib.error.HTTPError as error:
            return error.code, json.loads(error.read())

    def test_create_repeat_and_validation_contract(self) -> None:
        payload = {
            "attendance_id": "ATD-001",
            "event_type": "correcao_prioridade",
            "priority": "P2",
            "reason": "Prioridade corrigida após nova conferência operacional.",
            "author": "teste",
        }
        first_status, first = self.request("/api/v1/events", payload, "http-contract-key")
        repeat_status, repeat = self.request("/api/v1/events", payload, "http-contract-key")
        invalid_status, invalid = self.request(
            "/api/v1/events",
            {**payload, "priority": "urgente"},
            "invalid-contract-key",
        )

        self.assertEqual(first_status, 201)
        self.assertTrue(first["created"])
        self.assertEqual(repeat_status, 200)
        self.assertFalse(repeat["created"])
        self.assertEqual(first["event"]["evento_id"], repeat["event"]["evento_id"])
        self.assertEqual(invalid_status, 422)
        self.assertEqual(invalid["error"]["code"], "invalid_priority")


if __name__ == "__main__":
    unittest.main()
