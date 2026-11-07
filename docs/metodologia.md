# Metodologia operacional

## 1. Unidade de trabalho

Uma mensagem não é uma tarefa. Um atendimento é uma intenção operacional distinta de um usuário, vinculada a uma empresa e a um objeto quando identificáveis.

Exemplos:

- as mensagens repetidas de Mauro pedindo a guia de outubro pertencem ao mesmo atendimento;
- a guia de setembro de Mauro é outro atendimento porque a competência mudou;
- o recibo de pró-labore e a correção de endereço de Gabi são atendimentos distintos;
- a nota de R$ 2.400 cancelada por Diego não pode ser reutilizada para a nova nota de R$ 1.800.

## 2. Agrupamento

Para vincular uma mensagem, compare nesta ordem:

1. usuário;
2. empresa envolvida;
3. intenção ou ação solicitada;
4. objeto: nota, guia, competência, cadastro, cobrança ou documento;
5. continuidade temporal e referências como “aquela”, “também” e “continua”;
6. compatibilidade com o estado atual.

Crie um atendimento quando não houver candidato compatível. Em caso ambíguo, marque `revisao_necessaria=sim` em vez de escolher silenciosamente.

## 3. Categorias

- `emissao_nota`
- `guia_imposto`
- `cadastro_empresa`
- `alteracao_cadastral`
- `cobranca_assinatura`
- `cancelamento_assinatura`
- `encerramento_empresa`
- `documento_folha`
- `declaracao_relatorio`
- `comercial_migracao`

## 4. Estados

- `novo`: identificado, ainda não assumido;
- `em_analise`: operador conferindo informações ou sistemas;
- `aguardando_cliente`: falta informação ou ação do cliente;
- `aguardando_interno`: depende de outra pessoa ou sistema da Coeh;
- `retorno_agendado`: existe data combinada para nova ação;
- `concluido`: operador confirmou conclusão ou há evidência suficiente revisada;
- `cancelado`: solicitante retirou o pedido;
- `sem_acao`: orientação prestada ou intenção futura sem ação atual.

## 5. Prioridade

A fila usa quatro faixas. A faixa é mais importante que um número aparentemente preciso.

### P0 — agir agora

Prazo vencido ou no mesmo dia, com impacto financeiro/operacional relevante; bloqueio ativo ou risco imediato; compromisso já descumprido.

### P1 — agir em seguida

Prazo no próximo dia útil; risco concreto de bloqueio; cliente dependente da ação para receber ou operar; cobrança repetida com impacto.

### P2 — planejar

Prazo dentro de alguns dias, pendência acionável sem bloqueio imediato ou tarefa importante sem urgência comprovada.

### P3 — acompanhar

Prazo distante, intenção futura, aguardando cliente, orientação informativa, concluído ou cancelado. Concluídos e cancelados não entram na fila ativa.

## 6. Desempate dentro da faixa

1. prazo mais próximo;
2. compromisso anterior descumprido;
3. bloqueio de recebimento ou operação;
4. quantidade de cobranças sem resposta;
5. mensagem mais antiga.

Não elevar prioridade somente por caixa alta ou pela palavra “urgente”. Não reduzir prioridade somente porque falta comprovação: nesse caso, o próximo passo pode ser conferir ou perguntar imediatamente.

## 7. Trabalho humano

O operador deve registrar eventos, nunca reescrever o passado. Cada evento contém: atendimento, tipo, autor, instante, valor anterior, valor novo, motivo e próximo retorno quando aplicável.

Eventos usados na demonstração:

- correção de prioridade;
- espera por informação;
- conclusão confirmada.

## 8. Precedência e preservação

1. Mensagem original é imutável.
2. IA produz sugestão.
3. Evento humano pode corrigir a sugestão.
4. Mensagem nova pode trazer evidência que muda o cenário.
5. A mudança é adicionada ao histórico; nada anterior é apagado.

Uma correção humana não é uma trava eterna. Ela continua valendo até surgir evidência nova incompatível. Nesse caso, a IA propõe a mudança e explica por que a revisão é necessária.

## 9. Idempotência

Antes de criar uma tarefa, procure por ID e chave natural. A chave natural sugerida combina `usuario + empresa + categoria + objeto + competencia`. Processar a mesma linha novamente deve produzir o mesmo vínculo, não um novo atendimento.

## 10. Limites

- relatos não comprovam execução;
- anexos, e-mails e sistemas citados não estão disponíveis;
- a IA não presta orientação tributária especializada;
- prioridade expressa risco operacional, não certeza sobre fatos externos.
