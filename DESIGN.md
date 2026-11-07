# Direção aprovada e aplicada

O protótipo em painel/prototipo foi aprovado pelo usuário e promovido à página principal. O layout é a fonte visual; o cliente real em painel/app.js usa painel/api.js e o contrato já existente do backend.

Fila e leitura paralelas em desktop, navegação por estados e abas para mensagens/histórico. Em viewport estreito, lista e detalhe ficam em etapas distintas. Mantidos paleta Coeh, SVG oficial do cabeçalho, tipografia local, espaços e hierarquia aprovados. As únicas diferenças necessárias são o estado de conexão, a atualização da fila e os textos que descrevem gravação persistente.

Não há simulação de salvamento na página principal. Atualizações entram no diário eventos-runtime.csv e permanecem após recarregar. Resultados salvos e mensagens originais não são alterados. O protótipo anterior permanece explicitamente separado e somente em memória.

## Defaults e decisões

| Elemento | Decisão aprovada |
|---|---|
| Entrada | Fila, sem grade de métricas decorativas |
| Leitura | Pedido e fila lado a lado; abas para consulta |
| Ações | Responsável no cabeçalho; andamento, espera e conclusão no rodapé |
| Marca | Arquivo oficial, paleta marrom/creme/amarelo |
| Confirmação | Histórico devolvido pelo servidor, sem sucesso simulado |

Referências de método e testes visuais: painel/prototipo/DESIGN.md. Verificação do sistema aplicado: design-qa.md.
