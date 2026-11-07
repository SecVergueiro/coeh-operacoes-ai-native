# Contrato da API local

O servidor existe para demonstrar o acompanhamento manual. Ele não é uma API de produção e escuta apenas em `127.0.0.1` por padrão.

## Consultar estado

`GET /api/v1/state`

Retorna o snapshot final acrescido dos eventos registrados depois do corte. A resposta contém `attendances`, `events`, instante da análise e fuso.

## Registrar evento

`POST /api/v1/events`

Cabeçalhos:

```text
Content-Type: application/json
Idempotency-Key: <valor único entre 8 e 120 caracteres>
```

Exemplo:

```json
{
  "attendance_id": "ATD-001",
  "event_type": "correcao_prioridade",
  "priority": "P2",
  "reason": "Prioridade corrigida após nova conferência operacional.",
  "author": "operador",
  "return_at": null
}
```

Tipos aceitos:

- `correcao_prioridade`, com `priority` entre P0 e P3;
- `aguardar_informacao`, com `return_at` opcional;
- `conclusao`.
- `assumir`, que registra o responsável e coloca em análise;
- `andamento`, que registra a ação sem alterar o estado;
- `dependencia_interna`, com `return_at` opcional, que coloca em espera pela equipe.

`return_at` fica separado do prazo do cliente. A interface envia o horário de Brasília com offset `-03:00`. Após cada gravação, o servidor retorna o estado completo confirmado; o painel não considera o registro salvo antes dessa resposta.

## Respostas

- `201 Created`: evento novo, com cabeçalho `Location`;
- `200 OK`: a chave de idempotência já havia sido processada;
- `400 Bad Request`: chave de idempotência inválida ou JSON malformado;
- `404 Not Found`: atendimento inexistente;
- `413 Payload Too Large`: corpo vazio ou acima de 16 KB;
- `415 Unsupported Media Type`: conteúdo não enviado como JSON;
- `422 Unprocessable Entity`: campos incompatíveis com o domínio.

Erros possuem formato estável:

```json
{
  "error": {
    "code": "invalid_priority",
    "message": "Escolha uma prioridade entre P0 e P3."
  }
}
```
