# ADR 001 — servidor local opcional

## Contexto

O desafio aceita código opcional e prioriza processo. O painel estático demonstra a fila, mas não permite registrar uma decisão humana de ponta a ponta. Uma aplicação completa com banco, autenticação e infraestrutura aumentaria o escopo sem melhorar a resposta principal do desafio.

## Decisão

Adicionar um servidor local monolítico e sem dependências externas:

- serve os arquivos do painel;
- oferece `GET /api/v1/state`;
- oferece `POST /api/v1/events`;
- persiste eventos novos em CSV separado;
- aplica validação, chave de idempotência e escrita atômica;
- mantém o painel estático como fallback somente leitura.

## Invariantes

1. Mensagens e resultados originais não são alterados.
2. Evento manual é somente de acréscimo.
3. Mesma chave de idempotência não cria dois eventos.
4. Atendimento inexistente retorna 404 e nunca é criado implicitamente.
5. Prioridade e status aceitam apenas valores conhecidos.
6. Escrita usa arquivo temporário e substituição atômica.

## Alternativas rejeitadas

- **Framework e banco relacional:** adequados a produção, excessivos para uma demonstração local com 22 atendimentos.
- **Salvar apenas no navegador:** não permite que outra sessão ou pessoa continue o fluxo pelo repositório.
- **Alterar diretamente o snapshot final:** apagaria a separação entre estado do corte e decisões feitas depois.

## Limites e gatilho de revisão

O lock protege apenas um processo. Se houver múltiplas instâncias, usuários simultâneos, autenticação ou implantação real, migrar eventos para banco com transação e controle de acesso. O servidor local não é uma API de produção.
