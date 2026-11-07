const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../painel/api.js'), 'utf8');
const snapshot = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../painel/data.js'), 'utf8'), {window: snapshot});
function state() {
  return {generated_at: snapshot.COEH_DATA.gerado_em, timezone: snapshot.COEH_DATA.fuso,
    attendances: structuredClone(snapshot.COEH_DATA.atendimentos), events: structuredClone(snapshot.COEH_DATA.eventos)};
}
function client(fetch) {
  let sequence = 0;
  const window = {crypto: {randomUUID: () => `test-key-${++sequence}`}};
  vm.runInNewContext(script, {window, fetch, AbortController, setTimeout, clearTimeout, TypeError, SyntaxError});
  return window.COEH_API;
}
const command = {attendance_id:'ATD-006', event_type:'andamento', author:'Teste', reason:'Conferência registrada para o teste.'};

test('carrega o estado confirmado e o histórico do servidor', async () => {
  const payload = state();
  payload.attendances[0].responsavel = 'Responsável persistido';
  const api = client(async () => ({ok:true, json:async () => payload}));
  const result = await api.load();
  assert.equal(result.atendimentos[0].responsavel, 'Responsável persistido');
  assert.equal(result.eventos.length, 3);
});

test('reenvio após perda de resposta mantém a chave e aceita registro já salvo', async () => {
  const calls = [];
  const api = client(async (url, options) => {
    calls.push(options);
    if (calls.length === 1) throw new TypeError('network lost');
    return {ok:true, json:async () => ({created:false,event:{evento_id:'EVT-004'},state:state()})};
  });
  const pending = api.prepare(command);
  await assert.rejects(api.register(pending), /campos foram mantidos/);
  const retried = api.prepare(command, pending);
  assert.equal(retried, pending);
  const result = await api.register(retried);
  assert.equal(result.created, false);
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
  assert.equal(calls[0].body, calls[1].body);
});

test('dados inconsistentes não substituem o estado da interface', async () => {
  const payload = state();
  payload.attendances.push(payload.attendances[0]);
  const api = client(async () => ({ok:true, json:async () => payload}));
  await assert.rejects(api.load(), /não puderam ser conferidos/);
});

test('erro de validação do servidor é entregue sem confirmação de sucesso', async () => {
  const api = client(async () => ({ok:false, json:async () => ({error:{message:'Escolha uma prioridade entre P0 e P3.'}})}));
  await assert.rejects(api.register(api.prepare(command)), /Escolha uma prioridade/);
});

test('resposta de gravação incompleta não é tratada como sucesso', async () => {
  const api = client(async () => ({ok:true, json:async () => ({created:true,event:{evento_id:'EVT-004'},state:{}})}));
  await assert.rejects(api.register(api.prepare(command)), /resposta da fila está incompleta/);
});
