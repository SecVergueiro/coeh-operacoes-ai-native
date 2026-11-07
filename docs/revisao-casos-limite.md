# Revisão dos casos-limite

Esta revisão procura os erros que mais prejudicariam a operação: juntar pedidos diferentes, duplicar o mesmo pedido, apagar decisão humana ou inventar certeza.

## Mauro: repetição versus nova competência

As linhas 20 e 21 são repetição literal e pertencem a `ATD-016`. A linha 32 confirma que não são dois pedidos. A linha 61 acrescenta setembro, criando `ATD-017`, porque a competência faz parte da identidade da tarefa.

## Diego: mesmo contato, empresas e pedidos diferentes

`ATD-005` representa R$ 2.400 pela Horizonte Eventos e permanece cancelado. `ATD-022` representa R$ 1.800 pela Horizonte Pesquisa. Reutilizar o ID antigo apagaria o cancelamento e misturaria empresas.

## Nina: duas intenções na mesma mensagem

Cancelar assinatura (`ATD-010`) e encerrar empresa (`ATD-011`) são ações diferentes. A cliente autorizou somente a primeira. A segunda permanece `sem_acao`, impedindo que a IA transforme uma dúvida em autorização.

## Gabi e Ana: pedidos paralelos

O recibo de Gabi está concluído, mas a alteração de endereço continua aberta. A guia de Ana está concluída, mas a nota continua aberta. O estado de uma tarefa não contamina a outra.

## Fabio: causa do bloqueio mudou

Certificado expirado e erro de autenticação são etapas do mesmo problema para a primeira nota, então atualizam `ATD-004`. A segunda nota ainda sem dados é `ATD-021`.

## Bruno: conclusão preservada

A confirmação do cancelamento da nota 42 conclui `ATD-007`. Cobranças anteriores não geram nova tarefa após essa conclusão.

## Otavio: linguagem urgente, prazo confortável

A primeira sugestão supervalorizou a palavra “URGENTE”. O evento humano reduziu a prioridade para P3. A mensagem posterior, com entrega aceita até 18/11 e sem crédito em análise, confirma a correção.

## Elisa: risco próximo, não bloqueio atual

No corte das 16h de 05/11, Elisa ainda consegue acessar o sistema. O bloqueio pode ocorrer em 06/11. Portanto, P1 é coerente: agir em seguida. P0 afirmaria uma urgência imediata que a mensagem não comprova.

## Carla: vínculo seguro, decisão insegura

A mensagem pertence ao cadastro de Carla, mas a IA não conhece a regra para comprovante em nome do marido. O atendimento exige revisão humana e uma resposta baseada na política real.

## Prazos sem horário

Quando a mensagem informa somente a data, o campo guarda somente `AAAA-MM-DD`. A solução não inventa 00h, 17h ou 23h59. O horário só aparece quando foi explicitamente informado.
