"""Valida a integridade estrutural da demonstração sem chamar IA."""

from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FILA = ROOT / "dados" / "estado" / "atendimentos.csv"
EVENTOS = ROOT / "dados" / "eventos-manuais.csv"

PRIORIDADES = {"P0", "P1", "P2", "P3"}
STATUS = {
    "novo",
    "em_analise",
    "aguardando_cliente",
    "aguardando_interno",
    "retorno_agendado",
    "concluido",
    "cancelado",
    "sem_acao",
}


def ler_csv(caminho: Path) -> list[dict[str, str]]:
    with caminho.open(encoding="utf-8", newline="") as arquivo:
        return list(csv.DictReader(arquivo))


def main() -> None:
    erros: list[str] = []
    atendimentos = ler_csv(FILA)
    eventos = ler_csv(EVENTOS)

    ids = [item["atendimento_id"] for item in atendimentos]
    if len(ids) != len(set(ids)):
        erros.append("Há IDs de atendimento duplicados no estado atual.")

    for item in atendimentos:
        atendimento_id = item["atendimento_id"]
        if item["prioridade"] not in PRIORIDADES:
            erros.append(f"{atendimento_id}: prioridade inválida.")
        if item["status"] not in STATUS:
            erros.append(f"{atendimento_id}: status inválido.")
        if not item["linhas_mensagem"]:
            erros.append(f"{atendimento_id}: nenhuma mensagem vinculada.")

    ids_evento = [evento["evento_id"] for evento in eventos]
    if len(ids_evento) != len(set(ids_evento)):
        erros.append("Há IDs de evento duplicados.")

    for evento in eventos:
        if evento["atendimento_id"] not in set(ids):
            erros.append(
                f"{evento['evento_id']}: atendimento inexistente "
                f"{evento['atendimento_id']}."
            )

    linhas_vinculadas: set[int] = set()
    for item in atendimentos:
        for valor in item["linhas_mensagem"].split("|"):
            linha = int(valor)
            if linha < 2 or linha > 97:
                erros.append(f"{item['atendimento_id']}: linha {linha} fora da base.")
            linhas_vinculadas.add(linha)

    faltantes = sorted(set(range(2, 98)) - linhas_vinculadas)
    if faltantes:
        erros.append(f"Mensagens sem vínculo: {faltantes}")

    if erros:
        print("VALIDAÇÃO: FALHOU")
        for erro in erros:
            print(f"- {erro}")
        raise SystemExit(1)

    print("VALIDAÇÃO: APROVADA")
    print(f"- {len(atendimentos)} atendimentos com IDs únicos")
    print(f"- {len(eventos)} eventos manuais com IDs únicos")
    print(f"- {len(linhas_vinculadas)} mensagens vinculadas")
    print("- prioridades, estados e referências válidos")


if __name__ == "__main__":
    main()
