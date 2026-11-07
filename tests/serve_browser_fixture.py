"""Servidor isolado para conferir a interface sem alterar eventos da entrega.

Execute diretamente:
python tests/serve_browser_fixture.py
"""
from __future__ import annotations

import shutil
import sys
import tempfile
from pathlib import Path
from http.server import ThreadingHTTPServer

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.repository import CsvRepository
from backend.server import AppHandler
from backend.service import QueueService


def main() -> None:
    work = ROOT / "work"
    work.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="browser-", dir=work) as temporary:
        fixture = Path(temporary)
        shutil.copy2(ROOT / "dados/estado/atendimentos.csv", fixture / "state.csv")
        shutil.copy2(ROOT / "dados/eventos-manuais.csv", fixture / "history.csv")

        class FixtureHandler(AppHandler):
            quiet = True
            service = QueueService(CsvRepository(fixture / "state.csv", fixture / "history.csv", fixture / "runtime.csv"))

            def do_POST(self) -> None:
                # A primeira tentativa falha de forma controlada para testar recuperação.
                if not getattr(self.server, "failure_exercised", False):
                    self.server.failure_exercised = True
                    self._error(503, "test_unavailable", "Servidor temporariamente indisponível. Seus campos foram mantidos. Tente novamente.")
                    return
                super().do_POST()

        server = ThreadingHTTPServer(("127.0.0.1", 8766), FixtureHandler)
        print("Fixture isolada: http://127.0.0.1:8766", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            server.server_close()


if __name__ == "__main__":
    main()
