# Protótipo: caixa de trabalho Coeh

Proposta nova, criada em arquivos independentes. Não utiliza o layout, CSS ou código de apresentação do painel anterior. Compartilha somente os dados fictícios de origem. Referência: marca oficial e paleta consultadas no site da Coeh; SVG exato do cabeçalho público extraído em 06/11/2026, exibido em monocromia por CSS. O arquivo logocx.png do tema era um placeholder e foi descartado após inspeção.

## Tarefa e critério de aceite

Operação precisa escolher um atendimento, conferir a evidência, entender a próxima ação e registrar andamento. O critério é completar esse percurso sem descobrir que uma linha de tabela abre uma janela, nem procurar o formulário ao fim de conteúdo longo.

## Direção

- Caixa de trabalho com navegação de estados, lista de pedidos e leitura lado a lado.
- Pedido inicial selecionado em desktop; em telas estreitas, lista e detalhe ocupam uma etapa por vez, com retorno explícito.
- Nenhum dashboard de métricas: contagens ficam no lugar em que ajudam a navegar.
- Prioridade, prazo e responsável são comparáveis em três campos; mensagens e decisões são consultadas em abas.
- Próxima ação é a única superfície amarela de destaque. Rodapé concentra registro, espera e conclusão.

## Tokens

Marrom de marca #3e1e14; amarelo #fff6aa; canvas #f7f5ef; superfície #ffffff; linha #e8e3da; texto secundário #766b64. Fonte de interface Segoe UI/Arial, local. Logo oficial como imagem, sem redesenho ou simulação da fonte comercial.

## Interações

Busca, filtros de estado e prioridade, seleção, abas, teclado de abas, mensagens originais, histórico, responsável, registro, espera, correção de prioridade e conclusão. Dados de simulação ficam na memória da aba. Não há chamada de escrita à API nem alteração das filas da entrega.

## Fontes de método

Skills ui-ux-pro-max (consulta design-system executada) e design canônica em C:/dev/sec-brain/skills/design. Aplicadas as referências frontend-design, better-layout, ux-frontend, produto-operacional e validacao-por-jornada. A sugestão automática de landing/FAQ da busca não correspondia à tarefa e foi descartada. Usadas recomendações de interação, foco e redução de carga de decisão, subordinadas à marca e à operação.

## Varredura de defaults

| Elemento | Default evitado | Decisão |
|---|---|---|
| Entrada | Grade de métricas | Abrir diretamente na fila e no primeiro pedido |
| Navegação | Menus de módulos inexistentes | Apenas estados existentes dos atendimentos |
| Identidade | Fonte de display genérica e marca desenhada | Logo oficial e tipografia local de interface |
| Conteúdo | Tabela seguida de modal longo | Lista e leitura paralelas, com abas de consulta |
| Ações | Seis botões equivalentes | Assumir no cabeçalho; andamento, espera e conclusão no rodapé |
| Cor | Fundo acentuado em toda a tela | Amarelo reservado à sugestão e à seleção |

## Limites

É um protótipo de design. Registros se perdem ao recarregar. Não substitui a solução submetida até aprovação da direção. A IA não é executada por esta página. Não foram acrescentadas mensagens à demonstração original.

## Verificação executada

Navegador local em 06/11/2026: revisão visual a 1440×1000 e 390×844; geometria e controles a 1024×768, 768×900 e 320×740. O viewport foi restaurado ao final. Ajustado posteriormente o espaçamento das ações abaixo de 359px. Zoom real de 200%, leitor de tela e teste com pessoa externa não executados.

Fluxos observados: oito mensagens de Lia disponíveis; setas do teclado trocando abas; histórico inicial vazio; registro sem nome apresenta erro e mantém o formulário; assumir com autor e motivo acrescenta evento à simulação; concluir reduz abertos de 15 para 14; histórico mantém as ações; recarregar restaura o estado; busca inexistente mostra vazio com recuperação; navegação móvel acessa sete encerrados; detalhe móvel tem voltar; formulário cabe no viewport estreito. Console sem avisos ou erros no teste. Nenhum POST à API é implementado no protótipo.

A imagem inicial encontrada no tema público era um placeholder. A inspeção visual levou à substituição pelo SVG real do cabeçalho. Não houve alteração em arquivos originais ou eventos da entrega.
