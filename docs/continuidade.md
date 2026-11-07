# Como continuar em uma sessão nova

## Entradas

Leia AGENTS.md, metodologia, modelo, estado atual, eventos simulados e eventos-runtime.csv. Receba as mensagens novas com linha estável, data e horário de Brasília, usuário e texto. Preserve o arquivo original; mensagens adicionais ficam em outro arquivo identificado. Não renumere mensagens antigas. Fixe o corte da análise antes de classificar.

## Procedimento

1. Copie o estado para uma proposta em `resultados/rodada-3/`, sem alterar as rodadas anteriores. Leia o estado efetivo: base atual mais eventos-runtime.csv. O painel aplica esses eventos ao carregar; eles não devem ser incorporados outra vez à base e reaplicados em duplicidade.
2. Use prompts/processar-mensagens.md. Para cada linha nova, registre vínculo, relação, evidência, dúvida e mudança sugerida. Para linha já vinculada, preserve o vínculo; uma correção exige explicação explícita.
3. Procure primeiro a intenção existente. Compare usuário, objeto, competência e empresa quando presente. Repetição e cobrança não geram novo atendimento. Aloque próximo ID livre somente para intenção distinta.
4. Use prompts/revisar-fila.md. Revise P0/P1 e amostra de P2/P3. Não consulte mensagens posteriores ao corte. Hoje e amanhã partem da data da mensagem.
5. Preserve o histórico humano. Se evidência nova contrariar uma correção, apresente a divergência para aprovação; não remova o evento. Responsável, registro de ação, dependência e retorno são dados operacionais. Retorno não substitui prazo do cliente.
6. Salve proposta de fila e revisão explicando antes/depois, linhas novas, IDs novos e decisões preservadas. O operador revisa antes de promover a proposta.
7. Valide a proposta, por exemplo, para uma base que termina na linha 100:

```bash
python scripts/validar_estado.py --fila resultados/rodada-3/fila.csv --ultima-linha 100
```

O arquivo de eventos pode ser selecionado com --eventos. A auditoria auditar_regras.py protege especificamente as duas rodadas originais; não exige que fatos posteriores mantenham os mesmos estados.

8. Reexecute a mesma entrada sobre a proposta: nenhuma linha ou atendimento deve ser acrescentado; confira IDs, vínculos e eventos. Essa conferência é assistida pela IA e pelo operador, não uma promessa de classificador automático.

## Persistência

As duas rodadas originais são resultados salvos de demonstração. O backend lê a base em dados/estado/atendimentos.csv e reaplica o diário runtime. Não substitua essa base indiscriminadamente por uma projeção que já contenha os mesmos eventos. Para este desafio, novas rodadas podem permanecer em arquivos separados revisáveis; não há obrigação de importar automaticamente para o painel.

## Limites de reprodução

Os scripts conferem estrutura e regras específicas, não comprovam entendimento semântico da IA. Os prompts são reproduzíveis como procedimento, mas respostas de modelos podem variar. Nenhum comando chama API de LLM. A IA participa pela sessão que lê o repositório, propõe e revisa os arquivos. Não há configuração secreta necessária.
