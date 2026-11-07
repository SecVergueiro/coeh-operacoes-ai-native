# Revisão pela perspectiva de avaliação

Esta é uma simulação crítica, não um parecer de Lucca. Fonte: documento original do desafio e estrutura da planilha fornecida.

## Falhas encontradas e corrigidas

- Acompanhamento incompleto: adicionados assumir atendimento, registrar andamento e aguardar equipe, com autor e histórico persistente.
- Retorno sobrescrevia prazo do cliente: os campos agora são separados. Adiar conferência não altera o compromisso original.
- Retry criava outra chave: a interface mantém a chave para reenvio do mesmo conteúdo após falha.
- Interface sem identidade: tokens oficiais do site https://coeh.co, consultados em 06/11/2026: marrom #3e1e14, creme #fffbf3, amarelo #fff6aa. Tipografia de interface usa fallback local; a fonte comercial Antonia não foi copiada.
- Estados técnicos pouco legíveis: traduzidos os estados principais para português de operação.

## Perguntas difíceis que a entrega deve responder

1. Onde está a evidência de cada prioridade? O detalhe permite abrir o texto original de cada mensagem vinculada, exportado diretamente das 96 linhas da planilha por scripts/extrair_mensagens.py.
2. Como entra uma mensagem nova? Pelo harness e prompts; o painel não executa um modelo. É preciso seguir AGENTS.md e os passos documentados de revisão e regeneração.
3. Como preservar decisões novas? A API reaplica eventos-runtime.csv sobre o estado. Ao processar outra rodada, o agente deve ler esse arquivo junto dos eventos simulados, sem apagá-lo.
4. O que é simulado? As duas filas salvas e os três eventos iniciais são demonstração; os registros feitos no painel são eventos locais separados.
5. Posso usar em produção? O servidor é uma demonstração local, com CSV e um processo. Autenticação, persistência concorrente entre processos e implantação não integram este desafio.

## Entrega ainda depende de ação externa

Gravar vídeo de até cinco minutos; publicar repositório privado na conta do candidato; conceder acesso ao avaliador. Esses itens não podem ser declarados concluídos por testes de código.

## Referências de método

Aplicados Roteador.md do sec-brain, perfil produto-operacional e base UX da skill design; contratos HTTP e idempotência do ramo Backend. Foco: evidência revisável, autoria humana, erro recuperável e identidade subordinada à fila de trabalho.
