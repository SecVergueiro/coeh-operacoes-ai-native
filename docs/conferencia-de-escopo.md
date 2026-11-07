# Conferência do escopo do desafio

Fonte: dados/originais/Projeto Coeh Operacoes.docx. Conferência em 06/11/2026.

| Requisito | Evidência na entrega | Situação |
|---|---|---|
| Base original preservada | dados/originais/ | Incluída |
| Agrupar e separar intenções | docs/metodologia.md; exemplos de Ana, Gabi, Mauro e Diego nas revisões | Documentado |
| Priorizar por prazo, impacto, cobranças e bloqueios | Metodologia, filas ordenadas e revisões | Documentado e auditado em casos específicos |
| Assumir, registrar ação, dependência, retorno e conclusão | Eventos manuais; painel e API local | Implementado; teste de fluxo operacional |
| IA sugere, pessoa revisa e executa | AGENTS.md; prompts/; uso-da-ia-e-limitacoes.md | Documentado |
| Primeira rodada: 63 mensagens, corte 04/11 às 18h BRT | resultados/rodada-1/ | 21 atendimentos; cobertura 2–64 validada |
| Três eventos simulados separados | dados/eventos-manuais.csv | Correção, espera e conclusão preservadas |
| Segunda rodada: 33 novas, corte 05/11 às 16h BRT | resultados/rodada-2/ | 22 atendimentos; cobertura total 2–97 validada |
| Interpretação inadequada e correção | Otavio: EVT-001 e exemplos/entrada-saida-revisao.md | Demonstrado como evento simulado |
| Repetir sem duplicar e continuar em nova sessão | AGENTS.md; docs/continuidade.md; parâmetros do validador | Procedimento explícito; sem alegação de teste independente com outro agente |
| Uso da IA, exemplos e limitações | docs/uso-da-ia-e-limitacoes.md; exemplos/ | Incluídos |
| Repositório privado na conta do candidato e acesso a Lucca | https://github.com/SecVergueiro/coeh-operacoes-ai-native | Repositório privado publicado; acesso de Lucca pendente do usuário exato |
| Vídeo até cinco minutos | demo/fala-video.md e roteiro.md | Roteiro pronto; gravação pendente |

## Evidências executadas

- Validador da rodada 1: 21 atendimentos únicos, 63 mensagens e três eventos.
- Validador da rodada 2: 22 atendimentos únicos, 96 mensagens e três eventos.
- Auditoria de regras: aprovada para os casos específicos da demonstração.
- Estado atual igual ao CSV da rodada 2; diário runtime sem eventos de teste.

Essas verificações não equivalem a uma revisão humana independente de todas as interpretações ou a uma execução de outro modelo em sessão nova. As filas são resultados salvos revisáveis, não a saída de um classificador automático executado pelos scripts.

## Escopo mantido

Não acrescentar integração com LLM, WhatsApp ou sistemas externos, novas telas ou filtros para fechar esta entrega. A interface é apoio opcional. A avaliação principal é o processo, a justificativa e a possibilidade de continuar usando os arquivos e as instruções.
