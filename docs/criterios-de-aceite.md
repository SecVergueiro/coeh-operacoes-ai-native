# Critérios de aceite

## Agrupamento

- Reprocessar a mesma mensagem não cria novo atendimento.
- Mensagens repetidas de Mauro sobre outubro permanecem em um único atendimento.
- Setembro e outubro de Mauro permanecem separados.
- Os dois pedidos de Gabi permanecem separados.
- As notas de Diego de R$ 2.400 e R$ 1.800 permanecem separadas.

## Prioridade

- Toda prioridade P0/P1 possui prazo ou risco explícito nas mensagens.
- A palavra “urgente” isolada não determina P0/P1.
- Mensagem nova pode aumentar ou reduzir prioridade com justificativa.
- Atendimento concluído, cancelado ou sem ação não aparece na fila ativa.

## Preservação humana

- Eventos manuais nunca são alterados durante o processamento.
- A conclusão de Bruno permanece após a segunda rodada.
- A correção de prioridade de Otavio permanece enquanto compatível com as mensagens novas.
- A espera de Ana fica no histórico mesmo quando dados novos permitem avançar.

## Continuidade

- Uma sessão nova consegue começar por `AGENTS.md`.
- O estado atual pode ser reconstruído das mensagens e dos eventos.
- As 96 mensagens possuem ao menos um vínculo.
- IDs de atendimento e evento são únicos.
- `scripts/validar_estado.py` termina com `VALIDAÇÃO: APROVADA`.
- `scripts/auditar_regras.py` termina com `AUDITORIA DE REGRAS: APROVADA`.
