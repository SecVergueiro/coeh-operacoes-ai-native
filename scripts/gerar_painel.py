"""Gera o arquivo de dados estático usado pelo painel local."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def ler_csv(caminho: Path) -> list[dict[str, str]]:
    with caminho.open(encoding="utf-8", newline="") as arquivo:
        return list(csv.DictReader(arquivo))


def main() -> None:
    payload = {
        "gerado_em": "2026-11-05T16:00:00-03:00",
        "fuso": "America/Sao_Paulo",
        "atendimentos": ler_csv(ROOT / "dados" / "estado" / "atendimentos.csv"),
        "eventos": ler_csv(ROOT / "dados" / "eventos-manuais.csv"),
    }
    destino = ROOT / "painel" / "data.js"
    destino.parent.mkdir(parents=True, exist_ok=True)
    conteudo = "window.COEH_DATA = " + json.dumps(
        payload, ensure_ascii=False, indent=2
    ) + ";\n"
    destino.write_text(conteudo, encoding="utf-8")
    print(f"Painel atualizado: {len(payload['atendimentos'])} atendimentos")


if __name__ == "__main__":
    main()
