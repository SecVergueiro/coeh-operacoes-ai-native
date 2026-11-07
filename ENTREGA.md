# Checklist de entrega

Conferência requisito por requisito e limites da validação: `docs/conferencia-de-escopo.md`. Continuidade em uma sessão nova: `docs/continuidade.md`.

## Conteúdo obrigatório

- [x] base recebida preservada em `dados/originais/`
- [x] README com objetivo, uso e reprodução
- [x] ponto de entrada `AGENTS.md`
- [x] metodologia de classificação e prioridade
- [x] acompanhamento manual e eventos separados
- [x] prompts e formato de entrada/saída
- [x] rodada 1 com 63 mensagens
- [x] correção de prioridade simulada
- [x] espera por informação simulada
- [x] conclusão simulada
- [x] rodada 2 com 33 mensagens novas
- [x] preservação das decisões humanas
- [x] prevenção de tarefas duplicadas
- [x] exemplo de interpretação inadequada corrigida
- [x] limitações da IA documentadas
- [x] painel para demonstração
- [x] verificações reproduzíveis
- [ ] vídeo final de até cinco minutos
- [x] repositório privado criado no GitHub: https://github.com/SecVergueiro/coeh-operacoes-ai-native
- [ ] acesso concedido à conta correta do Lucca

## Antes de publicar

1. Executar `python -m backend` e abrir `http://127.0.0.1:8765` no navegador.
2. Testar busca, filtros, abertura e fechamento dos detalhes.
3. Conferir o painel em janela larga e estreita.
4. Executar:

```bash
python scripts/gerar_painel.py
python scripts/validar_estado.py
python scripts/auditar_regras.py
python -m unittest discover -s tests -v
```

5. Confirmar que `git status` está limpo.
6. Gravar seguindo `demo/fala-video.md`.
7. Criar repositório privado com nome profissional, por exemplo `coeh-operacoes-ai-native`.
8. Enviar os commits da branch `main`.
9. Confirmar o usuário GitHub do Lucca antes de compartilhar.
10. Abrir o repositório em uma janela anônima ou sessão separada para confirmar que ele continua privado.

## Informações ainda necessárias

- usuário GitHub exato do Lucca;
- canal de envio do link;
- forma de disponibilização do vídeo: arquivo no repositório, link privado ou plataforma indicada por eles.

## Commits principais

- `2f4204b` — estrutura do desafio e classificação
- `483ba43` — painel visual da fila
- `3d7112f` — auditoria dos casos-limite
