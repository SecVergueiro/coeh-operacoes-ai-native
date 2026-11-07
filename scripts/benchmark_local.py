"""Benchmark sintético, local e leve do endpoint de estado."""

from __future__ import annotations

import json
import statistics
import sys
import threading
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.server import AppHandler, create_server  # noqa: E402


def percentile(values: list[float], percentage: float) -> float:
    ordered = sorted(values)
    position = min(len(ordered) - 1, round((len(ordered) - 1) * percentage))
    return ordered[position]


def main() -> None:
    AppHandler.quiet = True
    server = create_server(port=0)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{server.server_port}/api/v1/state"
    try:
        for _ in range(10):
            urllib.request.urlopen(url, timeout=2).read()

        durations: list[float] = []
        payload_size = 0
        for _ in range(200):
            start = time.perf_counter()
            with urllib.request.urlopen(url, timeout=2) as response:
                body = response.read()
                payload_size = len(body)
                if response.status != 200:
                    raise RuntimeError(f"HTTP inesperado: {response.status}")
            durations.append((time.perf_counter() - start) * 1000)

        assets = ["index.html", "styles.css", "data.js", "app.js"]
        asset_sizes = {name: (ROOT / "painel" / name).stat().st_size for name in assets}
        result = {
            "scenario": "200 GETs sequenciais após 10 aquecimentos",
            "requests": len(durations),
            "errors": 0,
            "p50_ms": round(statistics.median(durations), 3),
            "p95_ms": round(percentile(durations, 0.95), 3),
            "p99_ms": round(percentile(durations, 0.99), 3),
            "payload_bytes": payload_size,
            "static_assets_bytes": asset_sizes,
            "static_total_bytes": sum(asset_sizes.values()),
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
        AppHandler.quiet = False


if __name__ == "__main__":
    main()
