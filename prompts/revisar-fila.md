# Prompt de revisão humana assistida

Revise a fila como um auditor, não como o classificador original.

Para cada atendimento P0 ou P1:

1. cite as linhas que sustentam prazo e impacto;
2. procure contradições ou mensagens posteriores;
3. confirme se o próximo passo pode ser executado pela operação;
4. identifique informação externa que ainda precisa ser consultada;
5. verifique se existe atendimento duplicado;
6. confira se eventos humanos foram respeitados.

Depois, selecione uma amostra dos P2/P3 para procurar falsos negativos: prazos ignorados, bloqueios escondidos e pedidos diferentes agrupados indevidamente.

Saída:

- `aprovado`: evidência suficiente;
- `corrigir`: informe campo, valor atual, valor proposto e motivo;
- `revisao_humana`: alternativas plausíveis e pergunta necessária.
