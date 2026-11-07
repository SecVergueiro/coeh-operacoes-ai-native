# Prompt de processamento

Use este texto depois de ler `AGENTS.md` e os arquivos indicados nele.

## Tarefa

Processe apenas as mensagens recebidas até o `momento_da_analise`. Para cada mensagem ainda não vinculada:

1. identifique se cria ou atualiza um atendimento;
2. justifique o vínculo com evidências textuais;
3. extraia apenas dados presentes na mensagem;
4. sugira status, prioridade, prazo e próximo passo;
5. marque dúvidas e necessidade de revisão humana;
6. preserve eventos manuais anteriores;
7. não salve a proposta até verificar duplicidade.

## Formato por mensagem

```json
{
  "mensagem_linha": 0,
  "atendimento_id": "ATD-000",
  "relacao": "atualiza",
  "campos_sugeridos": {},
  "evidencias": [],
  "confianca": "alta|media|baixa",
  "revisao_necessaria": false,
  "duvida": null
}
```

## Verificação final

- A mesma mensagem foi processada antes?
- Um atendimento existente já representa esta intenção?
- A mensagem contém mais de uma intenção?
- Algum evento humano seria sobrescrito?
- A prioridade está apoiada em prazo e impacto, não apenas no tom?
- Uma conclusão está sendo inferida sem confirmação?
