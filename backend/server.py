"""Servidor HTTP local para o painel e a API de eventos manuais."""

from __future__ import annotations

import argparse
import json
import mimetypes
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from .domain import DomainError, parse_event_command
from .repository import CsvRepository
from .service import QueueService


ROOT = Path(__file__).resolve().parents[1]
PANEL = ROOT / "painel"


def build_service(root: Path = ROOT) -> QueueService:
    return QueueService(
        CsvRepository(
            root / "dados" / "estado" / "atendimentos.csv",
            root / "dados" / "eventos-manuais.csv",
            root / "dados" / "estado" / "eventos-runtime.csv",
        )
    )


class AppHandler(BaseHTTPRequestHandler):
    service = build_service()
    server_version = "CoehLocal/1.0"
    quiet = False

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/v1/health":
            self._json(HTTPStatus.OK, {"status": "ok"})
            return
        if path == "/api/v1/state":
            self._json(HTTPStatus.OK, self.service.get_state(), cache="no-store")
            return
        self._static(path)

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path != "/api/v1/events":
            self._error(HTTPStatus.NOT_FOUND, "route_not_found", "Rota não encontrada.")
            return

        idempotency_key = self.headers.get("Idempotency-Key", "").strip()
        try:
            payload = self._read_json(max_bytes=16_384)
            command = parse_event_command(payload)
            event, created, state = self.service.register_event(command, idempotency_key)
            self._json(
                HTTPStatus.CREATED if created else HTTPStatus.OK,
                {"event": event, "created": created, "state": state},
                extra_headers={"Location": f"/api/v1/events/{event['evento_id']}"},
            )
        except DomainError as error:
            self._error(error.status, error.code, error.message)
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._error(HTTPStatus.BAD_REQUEST, "invalid_json", "O corpo JSON é inválido.")

    def _read_json(self, max_bytes: int) -> dict[str, object]:
        content_type = self.headers.get("Content-Type", "")
        if "application/json" not in content_type:
            raise DomainError("unsupported_media_type", "Envie Content-Type application/json.", 415)
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise DomainError("invalid_content_length", "O tamanho do corpo é inválido.", 400) from error
        if length <= 0 or length > max_bytes:
            raise DomainError("invalid_content_length", "O corpo deve ter até 16 KB.", 413)
        payload = json.loads(self.rfile.read(length))
        if not isinstance(payload, dict):
            raise DomainError("invalid_payload", "O corpo deve ser um objeto JSON.")
        return payload

    def _static(self, request_path: str) -> None:
        relative = "index.html" if request_path in {"", "/"} else request_path.lstrip("/")
        candidate = (PANEL / relative).resolve()
        if PANEL.resolve() not in candidate.parents and candidate != PANEL.resolve():
            self._error(HTTPStatus.NOT_FOUND, "file_not_found", "Arquivo não encontrado.")
            return
        if not candidate.is_file():
            self._error(HTTPStatus.NOT_FOUND, "file_not_found", "Arquivo não encontrado.")
            return
        content = candidate.read_bytes()
        mime = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{mime}; charset=utf-8" if mime.startswith("text/") or mime.endswith("javascript") else mime)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store" if candidate.name in {"index.html", "data.js"} else "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'")
        self.end_headers()
        self.wfile.write(content)

    def _json(
        self,
        status: int,
        payload: object,
        cache: str = "no-store",
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", cache)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Request-Id", self.headers.get("X-Request-Id", "local"))
        for name, value in (extra_headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(content)

    def _error(self, status: int, code: str, message: str) -> None:
        self._json(status, {"error": {"code": code, "message": message}})

    def log_message(self, format: str, *args: object) -> None:
        if not self.quiet:
            print(f"{self.address_string()} {format % args}")


def create_server(host: str = "127.0.0.1", port: int = 8765) -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), AppHandler)


def main() -> None:
    parser = argparse.ArgumentParser(description="Servidor local do painel Coeh")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = create_server(args.host, args.port)
    print(f"Painel disponível em http://{args.host}:{server.server_port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
