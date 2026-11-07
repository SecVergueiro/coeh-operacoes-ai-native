# Verificação de performance

## Baseline anterior

A primeira versão era inteiramente estática e totalizava aproximadamente 34.840 bytes nos quatro arquivos principais. Ela não possuía API nem persistência interativa, portanto não existe latência anterior comparável para o endpoint.

## Medição anterior (quatro arquivos)

Ambiente: execução local no Windows, Python empacotado do Codex, uma única máquina e dados fictícios. Cenário: 10 requisições de aquecimento e 200 requisições sequenciais a `GET /api/v1/state`.

Resultado medido em 06/11/2026:

| Medida | Resultado |
|---|---:|
| Erros | 0 |
| p50 | 1,591 ms |
| p95 | 2,127 ms |
| p99 | 2,361 ms |
| Resposta JSON | 10.941 bytes |
| Arquivos estáticos | 44.382 bytes |

O aumento de aproximadamente 9,5 KB nos arquivos estáticos corresponde ao formulário, estados de erro, fallback e integração com a API. Não é apresentado como “otimização”: é custo medido de funcionalidade nova.

## Aplicação do design aprovado, 06/11/2026

Nova medição no mesmo cenário local de 200 consultas após dez aquecimentos: zero erros, p50 1,573 ms, p95 2,561 ms e p99 11,653 ms. O backend não foi alterado nesta rodada; as variações não são apresentadas como ganho de performance.

O inventário do script foi corrigido para contar todos os sete recursos carregados pela página: HTML, CSS, snapshot, mensagens, cliente de API, aplicação e SVG da marca. Total final medido em disco: 96.248 bytes. O total anterior de quatro arquivos não é diretamente comparável a este inventário completo. Não há fontes, bibliotecas ou recursos de terceiros carregados em runtime. O protótipo separado não integra o carregamento do sistema.

## Decisões de performance

- zero dependências de frontend e backend;
- um único carregamento do estado;
- busca e filtros executados localmente sobre 22 linhas;
- nenhum polling ou atualização periódica;
- painel continua disponível pelo snapshot quando a API falha;
- payload e corpo de escrita limitados;
- benchmark reproduzível em `scripts/benchmark_local.py`.

## Limites

O benchmark é sintético, sequencial e local. Não representa produção, rede real, múltiplos usuários ou volume crescente. Com milhares de atendimentos, o próximo passo seria paginação e persistência em banco. Com múltiplos processos, o CSV e o lock local deixam de ser suficientes.
