# Fala sugerida para o vídeo

O texto foi escrito para durar aproximadamente quatro minutos e meio em ritmo calmo. Não precisa ser decorado; use como guia.

## 0:00–0:35 — abertura

**Na tela:** planilha original.

“Olá. Esta é a minha proposta para o desafio de operações da Coeh. O problema que eu quis resolver é transformar mensagens intercaladas em uma fila que realmente possa ser operada. A unidade de trabalho não é uma mensagem: é um atendimento. Várias mensagens podem atualizar a mesma tarefa, e uma única mensagem também pode conter pedidos diferentes.”

## 0:35–1:10 — arquitetura da solução

**Na tela:** `README.md` e depois `AGENTS.md`.

“Eu desenhei um workflow AI-native com responsabilidade humana. A IA lê as mensagens, sugere agrupamento, classificação, prioridade e próximo passo. A pessoa de operações revisa, consulta os sistemas reais, executa a ação e registra o resultado. O estado fica em arquivos estruturados, não na memória da conversa. Por isso uma nova sessão consegue começar pelo AGENTS, ler a metodologia, o estado e os eventos manuais e continuar o trabalho.”

## 1:10–1:55 — classificação e duplicidade

**Na tela:** `resultados/rodada-1/fila.csv`.

“Na primeira rodada eu processei as 63 mensagens disponíveis até 4 de novembro às 18 horas e identifiquei 21 atendimentos. Um exemplo de deduplicação é Mauro: as duas mensagens iguais sobre outubro viraram uma tarefa. Quando ele pediu setembro, foi criado outro atendimento, porque a competência mudou. Com Gabi e Ana aconteceu o contrário: o mesmo contato possuía dois pedidos paralelos, e a conclusão de um não encerrou o outro.”

## 1:55–2:35 — prioridade

**Na tela:** `docs/metodologia.md` na seção de prioridade.

“A prioridade usa quatro faixas. P0 significa agir agora, por prazo vencido ou no mesmo dia e impacto relevante. P1 é o próximo da fila, por prazo no dia seguinte ou risco concreto de bloqueio. P2 é trabalho planejável e P3 é acompanhamento, espera ou caso encerrado. Eu não uso somente a palavra urgente. O caso de Otavio demonstra isso: a IA inicialmente supervalorizou o tom, mas o operador corrigiu para P3 ao considerar a data real da reunião.”

## 2:35–3:10 — ações humanas

**Na tela:** `dados/eventos-manuais.csv`.

“Aqui estão os três eventos manuais pedidos no desafio. Existe uma correção de prioridade para Otavio, uma espera por informação para a nota de Ana e a conclusão do cancelamento da nota 42 de Bruno. Esses eventos são separados das mensagens originais e somente adicionados ao histórico. A IA nunca apaga silenciosamente uma decisão humana.”

## 3:10–4:05 — segunda rodada e painel

**Na tela:** abrir `painel/index.html`, filtrar P0 e abrir Lia.

“Depois eu incorporei as 33 mensagens do dia 5, chegando a 22 atendimentos. A fila foi recalculada sem perder o histórico. Lia, Paula e Ana passaram a P0 por prazos vencidos ou no mesmo dia. Bruno continuou concluído. A nota cancelada de 2.400 reais de Diego permaneceu cancelada, enquanto a nova nota de 1.800 reais recebeu outro ID e a empresa correta. O painel permite pesquisar, filtrar e abrir o motivo da prioridade e o próximo passo.”

## 4:05–4:35 — limite e revisão humana

**Na tela:** abrir Carla no painel.

“A IA também declara quando não pode decidir. Carla enviou um comprovante em nome do marido. O vínculo com o cadastro é seguro, mas a regra de aceitação do documento não está na base. Portanto, a próxima ação é consultar a política real, e não inventar uma resposta.”

## 4:35–4:55 — validação e encerramento

**Na tela:** executar ou mostrar a saída dos dois scripts.

“Por fim, a validação confirma 22 atendimentos únicos, três eventos manuais e as 96 mensagens vinculadas. Uma segunda auditoria protege os casos de domínio mais sensíveis. O resultado é uma fila reproduzível, revisável e pronta para continuar com novas mensagens, mantendo a IA como apoio e a decisão operacional com a pessoa.”
