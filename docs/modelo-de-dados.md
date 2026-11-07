# Modelo de dados

## Mensagem original

**Grão:** uma linha representa uma mensagem recebida.

**Chave:** número da linha da planilha original.

Campos mínimos: linha, data, usuário e texto. O arquivo original não é alterado.

## Atendimento

**Grão:** uma linha representa uma intenção operacional distinta de um usuário.

**Chave substituta:** `ATD-NNN`.

**Chave natural de conferência:** usuário, empresa, categoria, objeto e competência. Campos desconhecidos não devem ser inventados.

Campos principais:

- `atendimento_id`
- `usuario`
- `empresa`
- `categoria`
- `objeto`
- `competencia`
- `status`
- `prioridade`
- `prazo`
- `resumo`
- `impacto`
- `proximo_passo`
- `linhas_mensagem`
- `atualizado_em`
- `revisao_necessaria`

## Evento manual

**Grão:** uma linha representa uma decisão ou ação humana em um atendimento, em um instante.

**Chave:** `EVT-NNN`.

Eventos são somente de acréscimo. Corrigir um evento exige outro evento compensatório, preservando a auditoria.

## Vínculo de mensagem

**Grão:** uma linha representa a relação entre uma mensagem e um atendimento.

Uma mensagem com duas intenções pode possuir dois vínculos explícitos. Isso não é duplicação: é decomposição registrada.

Relações permitidas: `cria`, `atualiza`, `cobra`, `corrige`, `cancela`, `conclui`, `reabre`.

## Fonte de verdade

- texto e horário: planilha original;
- decisão operacional: eventos manuais;
- estado atual: projeção reconstruível das mensagens mais eventos;
- sugestão de classificação: saída da IA, sempre revisável.
