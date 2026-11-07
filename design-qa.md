# Verificação da interface aprovada

## Direção aplicada

O usuário aprovou a proposta de caixa de trabalho e autorizou aplicá-la ao sistema. A página principal agora usa navegação por estados, lista de atendimentos e leitura paralela com abas. Marca e paleta oficiais preservadas. Referências e decisões em DESIGN.md; o protótipo anterior permanece separado.

## Jornada real observada no navegador

Em 06/11/2026 foi usado tests/serve_browser_fixture.py, servidor isolado na porta 8766 com cópias temporárias da base. Nenhum evento foi adicionado à fila principal.

- A página carrega o estado do servidor e habilita a gravação.
- Assumir com nome e motivo: a primeira tentativa retornou 503 controlado.
- O erro apareceu no formulário; nome e motivo foram mantidos.
- Reenvio salvou exatamente um evento; responsável e histórico permaneceram após recarregar.
- Dependência interna e retorno às 10h30 de Brasília foram salvos; prazo do cliente continuou 05/11 às 14h.
- Correção de prioridade persistiu e apareceu no histórico.
- Conclusão reduziu abertos de 15 para 14; após recarregar, o pedido estava entre oito encerrados, com os quatro registros preservados.
- Ao desligar o servidor isolado e atualizar a fila, o painel mostrou somente leitura, explicou a falha e desabilitou gravação.
- A página principal na porta 8765 foi aberta e conferida: título novo, estado carregado, zero erros de console e diário runtime sem registros de teste.
- A aba de prévia do protótipo foi direcionada à página principal.

## Verificações automatizadas

- Sete testes de domínio/HTTP aprovados.
- Cinco testes do cliente de API aprovados: estado persistido, reenvio com mesma chave, dados inválidos, erro de validação e resposta incompleta.
- Sintaxe de app.js e api.js conferida.
- Validação de 22 atendimentos, 96 mensagens e três eventos simulados aprovada.
- Auditoria das regras da demonstração aprovada.

## Limites

A revisão responsiva anterior do protótipo cobriu 1440, 1024, 768, 390 e 320 pixels. O sistema aplicado mantém esse CSS e foi observado no navegador em janela estreita, com o novo indicador de conexão. Não foi executada nova bateria em todas as larguras, zoom real de 200% ou leitor de tela. O teste de falha usa um servidor de teste temporário e não depende de interromper o servidor do usuário.

## Varredura de defaults

| Componente | Decisão |
|---|---|
| Entrada | Fila direta, sem grade genérica de indicadores |
| Navegação | Estados do atendimento, sem módulos fictícios |
| Conteúdo | Mensagens e histórico em abas, com próxima ação em destaque |
| Marca | SVG oficial e paleta aprovada |
| Gravação | Confirmação persistida pelo servidor e erro recuperável |
| Movimento | Somente resposta à interação; movimento reduzido respeitado |

Não houve criação de novas regras de classificação, integração com IA ou alteração dos resultados originais.
