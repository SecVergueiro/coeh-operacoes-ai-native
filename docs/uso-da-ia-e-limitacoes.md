# Uso da IA e limitações

## Como a IA participou da construção

A IA foi usada para:

- ler e decompor o enunciado em critérios verificáveis;
- sugerir agrupamentos entre mensagens e atendimentos;
- extrair empresa, objeto, competência, prazo e impacto;
- propor categorias, estados, prioridades e próximos passos;
- procurar casos de duplicidade e contradição;
- redigir a primeira versão do harness e dos exemplos.

As decisões foram revisadas contra a planilha original. Uma verificação determinística confere IDs, valores aceitos e cobertura das 96 mensagens. O uso de IA não substitui a revisão operacional.

## Como a IA participa da rotina proposta

Ela recebe metodologia, estado atual, eventos manuais e mensagens novas. Produz uma proposta estruturada de vínculos e atualizações. A proposta é revisada antes de se tornar estado operacional.

## Limitações observadas

1. O texto pode sugerir urgência sem impacto real, como no caso de Otavio.
2. Uma mesma mensagem pode conter mais de uma intenção, como no caso de Nina.
3. O mesmo usuário pode representar empresas distintas, como Diego.
4. Termos como “aquela nota” dependem do histórico e podem ser ambíguos.
5. A IA não vê e-mails, anexos, portais ou sistemas citados.
6. Relato de envio, pagamento ou execução não comprova o estado real.
7. Regras documentais e tributárias não devem ser inventadas.
8. Um classificador pode demonstrar excesso de confiança; por isso a saída contém confiança, evidência e indicador de revisão.

## Mitigações

- estado externo e histórico imutável;
- prioridade baseada em fatos observáveis;
- revisão humana para ações e regras de domínio;
- nova execução idempotente;
- validação automática de estrutura e cobertura;
- exemplos de baixa confiança no repositório.
