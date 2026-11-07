"""Testes de domínio para os casos-limite da demonstração."""

from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROUND_1 = ROOT / "resultados" / "rodada-1" / "fila.csv"
ROUND_2 = ROOT / "resultados" / "rodada-2" / "fila.csv"
EVENTS = ROOT / "dados" / "eventos-manuais.csv"


def read(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def index(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    return {row["atendimento_id"]: row for row in rows}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def validate_order(rows: list[dict[str, str]], name: str) -> None:
    orders = [int(row["ordem"]) for row in rows]
    require(orders == list(range(1, len(rows) + 1)), f"{name}: ordem não sequencial")
    rank = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
    priorities = [rank[row["prioridade"]] for row in rows]
    require(priorities == sorted(priorities), f"{name}: prioridades fora de ordem")


def main() -> None:
    round_1 = read(ROUND_1)
    round_2 = read(ROUND_2)
    events = read(EVENTS)
    r1 = index(round_1)
    r2 = index(round_2)

    validate_order(round_1, "rodada 1")
    validate_order(round_2, "rodada 2")

    require(len(round_1) == 21, "Rodada 1 deve conter 21 atendimentos")
    require(len(round_2) == 22, "Rodada 2 deve conter 22 atendimentos")

    require(r2["ATD-005"]["status"] == "cancelado", "Nota de R$ 2.400 deve permanecer cancelada")
    require(r2["ATD-022"]["empresa"] == "Horizonte Pesquisa", "Nova nota deve usar a empresa correta")
    require(r2["ATD-007"]["status"] == "concluido", "Conclusão de Bruno deve ser preservada")
    require(r2["ATD-020"]["prioridade"] == "P3", "Correção de prioridade de Otavio deve ser preservada")
    require(r2["ATD-016"]["status"] == "concluido", "Guia de outubro de Mauro deve estar concluída")
    require(r2["ATD-017"]["status"] != "concluido", "Guia de setembro de Mauro deve continuar separada")
    require(r2["ATD-002"]["status"] == "concluido", "Guia de Ana deve continuar concluída")
    require(r2["ATD-003"]["status"] == "em_analise", "Nota de Ana deve avançar após a chegada dos dados")
    require(r2["ATD-010"]["status"] != "concluido", "Cancelamento de Nina ainda requer conferência")
    require(r2["ATD-011"]["status"] == "sem_acao", "Baixa da empresa de Nina não foi autorizada")
    require(r2["ATD-012"]["prioridade"] == "P1", "Elisa é risco próximo, não bloqueio ativo no corte")
    require(r2["ATD-015"]["revisao_necessaria"] == "sim", "Documento de Carla exige regra humana")

    event_types = {(row["atendimento_id"], row["tipo"]) for row in events}
    require(("ATD-020", "correcao_prioridade") in event_types, "Falta correção de prioridade")
    require(("ATD-003", "aguardar_informacao") in event_types, "Falta evento de espera")
    require(("ATD-007", "conclusao") in event_types, "Falta evento de conclusão")

    print("AUDITORIA DE REGRAS: APROVADA")
    print("- ordenação por faixa de prioridade consistente")
    print("- 12 regras de domínio e 3 eventos manuais verificados")
    print("- separações, conclusões e cancelamentos preservados")


if __name__ == "__main__":
    main()
