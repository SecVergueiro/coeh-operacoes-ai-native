# Exemplo completo: entrada, sugestão e revisão

## Entrada

```json
{
  "linha": 78,
  "data": "2026-11-05T11:08:00-03:00",
  "usuario": "Otavio",
  "mensagem": "Se entregar até 18/11 está ótimo. É só uma reunião inicial, ainda não tem pedido de crédito em análise."
}
```

## Contexto anterior

`ATD-020` já existia para um relatório da Prisma Vídeo. O evento humano `EVT-001` havia corrigido a prioridade de P1 para P3 porque a palavra “URGENTE” da primeira mensagem não combinava com o prazo real.

## Sugestão da IA

```json
{
  "mensagem_linha": 78,
  "atendimento_id": "ATD-020",
  "relacao": "atualiza",
  "campos_sugeridos": {
    "prazo": "2026-11-18T23:59:00-03:00",
    "prioridade": "P3",
    "impacto": "reunião inicial; não há crédito em análise"
  },
  "evidencias": [
    "mesmo usuário e mesma empresa",
    "mesmo relatório de faturamento",
    "prazo explícito até 18/11",
    "ausência de bloqueio financeiro imediato"
  ],
  "confianca": "alta",
  "revisao_necessaria": false,
  "duvida": null
}
```

## Revisão humana

```json
{
  "decisao": "aprovar",
  "motivo": "A mensagem nova confirma a correção de prioridade registrada pelo operador.",
  "evento_novo": null
}
```

## Exemplo de baixa confiança

Na mensagem de Carla, o comprovante está em nome do marido. A IA não conhece a política documental da Coeh e deve produzir:

```json
{
  "mensagem_linha": 90,
  "atendimento_id": "ATD-015",
  "relacao": "atualiza",
  "confianca": "alta",
  "revisao_necessaria": true,
  "duvida": "A Coeh aceita comprovante de endereço em nome do cônjuge?",
  "proximo_passo": "Conferir a regra interna e informar exatamente qual documento é aceito."
}
```

O vínculo com o atendimento é seguro; a decisão sobre aceitar o documento não é.
