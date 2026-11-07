# Fila de operações AI-native da Coeh

Esta proposta transforma mensagens de clientes em uma fila operacional revisável. A IA interpreta, agrupa e sugere; uma pessoa confirma, executa e registra. O estado do trabalho fica em arquivos estruturados, não na memória de uma conversa.

## Objetivo

Permitir que a operação:

1. identifique pedidos distintos em mensagens intercaladas;
2. una continuações sem criar tarefas duplicadas;
3. trabalhe primeiro no que tem maior urgência e impacto;
4. registre responsável, ação, dependência, retorno e conclusão;
5. preserve correções humanas quando novas mensagens forem processadas;
6. retome o fluxo em uma nova sessão de IA.

## Comece por aqui

1. Leia `AGENTS.md`.
2. Consulte `docs/metodologia.md` e `docs/modelo-de-dados.md`.
3. Para reproduzir a demonstração, siga `demo/roteiro.md`.
4. Veja a fila inicial em `resultados/rodada-1/fila.csv`.
5. Veja os eventos manuais em `dados/eventos-manuais.csv`.
6. Veja a fila revisada em `resultados/rodada-2/fila.csv`.
7. Execute `python -m backend` e abra `http://127.0.0.1:8765` para navegar e registrar decisões.
8. Confira o atendimento ao enunciado e as pendências externas em `docs/conferencia-de-escopo.md`.

## Estrutura

```text
dados/originais/       material recebido, nunca alterado
dados/estado/          estado atual dos atendimentos
dados/eventos-manuais.csv  decisões humanas em ordem cronológica
docs/                  metodologia, modelo e regras operacionais
prompts/               instruções usadas pela IA
resultados/rodada-1/   corte de 04/11/2026 às 18h
resultados/rodada-2/   corte de 05/11/2026 às 16h
demo/                  roteiro da demonstração em vídeo
scripts/               verificações determinísticas de integridade
painel/                interface opcional; leitura estática ou servidor local
```

## Painel local

O painel funciona de duas formas:

- `python -m backend`: modo completo, com registro de decisões humanas;
- abrir `painel/index.html`: fallback somente leitura, sem servidor.

Para atualizar o snapshot depois de alterar a fila:

```bash
python scripts/gerar_painel.py
```

No modo completo, a tela permite assumir atendimentos, registrar andamento, dependência interna, retorno, correção de prioridade, espera ou conclusão. Eventos novos são gravados em `dados/estado/eventos-runtime.csv`; mensagens e resultados originais permanecem intactos.

Para continuar com mensagens adicionais em outra sessão, siga `docs/continuidade.md`. As duas filas em `resultados/` são resultados salvos, e EVT-001 a EVT-003 são eventos simulados. O painel não chama LLM: a IA participa pela sessão que usa AGENTS.md e os prompts, com revisão antes de salvar. Python 3.11 ou superior é necessário apenas para servidor e verificações; a leitura dos materiais não exige credenciais ou dependências externas.

## Verificações

```bash
python scripts/validar_estado.py
python scripts/auditar_regras.py
python -m unittest discover -s tests -v
python scripts/benchmark_local.py
```

O primeiro comando verifica estrutura, IDs e cobertura das mensagens. O segundo protege os casos de domínio que não podem regredir, como pedidos separados, cancelamentos e correções humanas.

## Princípio central

A IA nunca confirma que uma ação real foi executada apenas com base no relato do cliente. Ela pode sugerir classificação, prioridade, vínculo e próximo passo. A pessoa de operações consulta os sistemas reais, toma a decisão e registra um evento manual.

## Escopo

Esta demonstração não acessa WhatsApp, sistemas contábeis ou documentos citados nas mensagens. Ela organiza a fila e informa o que precisa ser conferido ou perguntado.

## Fontes internas usadas no desenho

O desenho segue três princípios da base técnica local: workflow determinístico antes de agente (`Padrões/Engenharia de IA/Engenharia de IA.md`), estado externo para continuidade (`Padrões/Engenharia de IA/Context engineering e prompting.md`) e grão/chave explícitos com execução idempotente (`Padrões/Dados e relatórios/Modelagem de dados operacionais.md` e `ETL leve e automação de relatórios.md`).
