# Verificação do painel

## Direção

Ferramenta operacional densa, com a fila como elemento principal. A tela usa neutros, bordas e uma faixa discreta de cor por prioridade. Não há marca oficial disponível; por isso o painel não inventa logo, tipografia ou identidade da Coeh.

## Jornada implementada

- visão da fila ativa por padrão;
- busca por cliente, empresa, atendimento ou categoria;
- filtros de prioridade e situação;
- vazio por filtro com ação para limpar;
- abertura de detalhes por clique, Enter ou espaço;
- fechamento por botão, fundo ou Escape;
- foco devolvido à linha após fechar;
- histórico de decisões humanas visível;
- formulário contextual para corrigir prioridade, aguardar informação ou concluir;
- validação antes do envio, estado “Registrando” e erro recuperável sem perder o texto;
- modo degradado explícito quando o servidor não responde;
- adaptação para larguras menores e movimento reduzido.

## Validação executada

- arquivos HTML, CSS e JavaScript disponíveis sem dependências externas;
- sintaxe dos dois arquivos JavaScript aprovada;
- HTML analisado sem erro estrutural pelo parser;
- index, CSS, dados e JavaScript responderam HTTP 200 em servidor temporário;
- estado operacional aprovado pelo validador: 22 atendimentos, 3 eventos e 96 mensagens vinculadas.
- seis testes de domínio e contrato HTTP aprovados, incluindo idempotência e erro de validação.
- benchmark local com 200 requisições: p95 de 2,618 ms, sem erros.

## Limite da verificação

A ferramenta de navegador da sessão não conseguiu acessar o servidor local do Windows. A inspeção visual e a jornada clicada no navegador ficaram pendentes. Antes da gravação, abrir `painel/index.html` no navegador e conferir desktop e janela estreita.

## Varredura de padrões genéricos

- sem grade de cartões idênticos: a fila usa tabela comparável;
- sem gradiente, vidro, glow ou sombra colorida;
- sem pílulas coloridas repetidas: prioridade usa uma régua vertical;
- sem ícones decorativos ou emoji;
- sem animações de entrada; apenas transição curta do painel de detalhes;
- sem métricas inventadas: todos os números vêm dos arquivos da demonstração;
- sem logo fictício: identidade oficial não foi fornecida.
