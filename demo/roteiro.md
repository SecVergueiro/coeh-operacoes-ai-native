# Roteiro da demonstração — até cinco minutos

## 0:00–0:35 — problema e proposta

Mostrar a planilha original e explicar: mensagem não é tarefa; a solução transforma conversas intercaladas em atendimentos priorizados, com revisão humana.

## 0:35–1:25 — harness

Abrir `AGENTS.md`, mostrar a ordem de leitura, as regras contra duplicidade e a precedência das decisões humanas.

## 1:25–2:10 — rodada 1

Abrir `resultados/rodada-1/fila.csv`. Destacar:

- Mauro: repetição não criou outra tarefa;
- Ana e Gabi: pedidos distintos foram separados;
- Lia e Paula: prazo e impacto elevaram prioridade;
- Otavio: palavra “URGENTE” não basta.

## 2:10–3:05 — ações manuais

Abrir `dados/eventos-manuais.csv` e mostrar:

1. prioridade de Otavio corrigida;
2. nota de Ana aguardando informação;
3. cancelamento da nota 42 de Bruno concluído.

Explicar que esses eventos ficam separados das mensagens e não são apagados.

## 3:05–4:20 — rodada 2

Abrir `resultados/rodada-2/fila.csv`. Mostrar que:

- Lia e Paula receberam nova urgência;
- dados novos de Ana permitem sair de `aguardando_cliente`;
- Bruno continua concluído;
- Diego recebe novo ID para a nota de R$ 1.800, enquanto a de R$ 2.400 permanece cancelada;
- Mauro não recebe duplicata pela guia de outubro.

## 4:20–5:00 — continuidade e limites

Executar `python scripts/validar_estado.py`. Explicar que uma nova sessão começa por `AGENTS.md`, lê estado e eventos, acrescenta novas mensagens e repete a validação. Reforçar que a IA sugere; o operador confirma ações nos sistemas reais.
