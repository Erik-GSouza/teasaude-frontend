import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
async function modulo(nome) {
  const tsFonte = readFileSync(new URL('../src/app/' + nome + '.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(tsFonte, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
  }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}
const { opcoesStatus, precisaMotivo, validarPaciente, validarCredenciais, dadosHorario } =
  await modulo('modelos');
const { requisicao } = await modulo('conexao');
const agora = Date.parse('2027-01-01T12:00:00Z'),
  hora = 3600000;
const agenda = (status, delta, fim = delta + 1) => ({
  status,
  dataHora: new Date(agora + delta * hora).toISOString(),
  disponibilidadeId: { fim: new Date(agora + fim * hora).toISOString() }
});
test('família cancela confirmação com 24 h ou mais; pendência futura pode ser retirada', () => {
  assert.deepEqual(opcoesStatus(agenda('agendada', 24), 'responsavel', agora), ['cancelada']);
  assert.deepEqual(opcoesStatus(agenda('agendada', 23.99), 'responsavel', agora), []);
  assert.deepEqual(opcoesStatus(agenda('pendente', 0.1), 'responsavel', agora), ['cancelada']);
  assert.deepEqual(opcoesStatus(agenda('pendente', 0), 'responsavel', agora), []);
});
test('gestor e admin concluem apenas após o término; recusa e cancelamento institucional pedem motivo', () => {
  for (const p of ['gestor', 'admin']) {
    assert.deepEqual(opcoesStatus(agenda('agendada', -2, 1), p, agora), []);
    assert.deepEqual(opcoesStatus(agenda('agendada', -2, 0), p, agora), ['concluida']);
    assert.ok(precisaMotivo('recusada', p));
    assert.ok(precisaMotivo('cancelada', p));
  }
  assert.ok(!precisaMotivo('cancelada', 'responsavel'));
  assert.deepEqual(opcoesStatus(agenda('pendente', 4), 'medico', agora), []);
});
test('data civil, limite de idade inicial e senha com caracteres multibyte', () => {
  const hoje = new Date(2027, 0, 1);
  assert.ok(validarPaciente('Ana', '2009-01-01', true, hoje));
  assert.equal(validarPaciente('Ana', '2009-01-02', true, hoje), '');
  assert.equal(validarPaciente('Ana', '2009-01-01', false, hoje), '');
  assert.ok(validarPaciente('Ana', '2026-02-30', true, hoje));
  assert.ok(validarPaciente('Ana', '2027-01-02', true, hoje));
  assert.ok(validarCredenciais('teste', '🔒'.repeat(19)));
  assert.equal(validarCredenciais('teste', '🔒'.repeat(8)), '');
});
test('horários têm fuso explícito e não admitem fim antes do início', () => {
  const r = dadosHorario('2027-01-04T10:00', '2027-01-04T10:30', agora);
  assert.ok(r.inicio.endsWith('Z'));
  assert.throws(() => dadosHorario('2027-01-04T10:30', '2027-01-04T10:00', agora));
});
test('cliente aceita DELETE 204 e não repete POST que falhou', async (t) => {
  let enviadas = 0;
  t.mock.method(globalThis, 'fetch', async (_u, o) => {
    enviadas++;
    assert.equal(o.headers.Authorization, 'Bearer amostra');
    return o.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : Response.json({ message: 'Conflito de horário' }, { status: 409 });
  });
  assert.equal(await requisicao('/pacientes/a', 'DELETE', undefined, 'amostra'), undefined);
  await assert.rejects(requisicao('/agendamentos', 'POST', {}, 'amostra'), /Conflito/);
  assert.equal(enviadas, 2);
});
test('cache instalável inclui o shell, ícones e ilustração, mas nenhum dado de sessão ou API', () => {
  const sw = JSON.parse(
    readFileSync(new URL('../dist/teasaude/browser/ngsw.json', import.meta.url))
  );
  assert.deepEqual(sw.dataGroups, []);
  const assets = sw.assetGroups.flatMap((g) => g.urls);
  assert.ok(assets.some((u) => u.endsWith('/jardim.svg')));
  assert.ok(assets.some((u) => u.endsWith('/icons/icon-512.png')));
  assert.ok(!assets.some((u) => u.includes('/api/') || u.endsWith('/config.json')));
});
