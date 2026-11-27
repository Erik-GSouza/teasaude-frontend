import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicativo, esperar, resposta } from './ambiente.mjs';
const instituicao = { _id: 'i', nomePublico: 'Clínica Escola' };
const medico = {
  _id: 'm',
  nomeCompleto: 'Profissional de teste',
  especialidade: 'Fonoaudiologia',
  instituicaoId: instituicao,
  modalidades: ['Presencial'],
  ativo: true
};
const pacientes = [
  { _id: 'p1', nomeCompleto: 'Paciente Um', dataNascimento: '2019-01-01' },
  { _id: 'p2', nomeCompleto: 'Paciente Dois', dataNascimento: '2020-08-15' }
];
const respostaLista = (k, v) => resposta({ [k]: v });
function base() {
  const banco = {
    horarios: [],
    agendamentos: [],
    cadastros: [],
    chamadas: [],
    expirado: false,
    conflito: false
  };
  const servir = (url, o) => {
    const rota = url.pathname.slice(4),
      metodo = o.method || 'GET',
      perfil = o.headers?.Authorization?.slice(7),
      dados = o.body ? JSON.parse(o.body) : null;
    banco.chamadas.push({ rota, metodo, perfil, dados, query: url.search });
    if (rota === '/auth/login') {
      assert.deepEqual(Object.keys(dados).sort(), ['nomeUsuario', 'senha']);
      return resposta({ token: dados.nomeUsuario });
    }
    if (rota === '/auth/cadastro') {
      banco.cadastros.push(dados);
      return resposta({ token: 'teste', usuario: {}, paciente: {} }, 201);
    }
    if (!perfil || banco.expirado) return resposta({ message: 'Sessão expirada' }, 401);
    if (rota === '/auth/me')
      return resposta({ usuario: { _id: perfil, nomeUsuario: perfil, perfil, ativo: true } });
    if (rota === '/pacientes/meus') return respostaLista('data', pacientes);
    if (rota === '/medicos') return respostaLista('medicos', [medico]);
    if (rota === '/medicos/m') return resposta({ medico });
    if (rota === '/disponibilidades' && metodo === 'POST') {
      assert.equal(perfil, 'medico');
      assert.deepEqual(Object.keys(dados).sort(), ['fim', 'inicio']);
      const h = { ...dados, _id: 'h', medicoId: medico, ativo: true, ocupada: false };
      banco.horarios.push(h);
      return resposta({ disponibilidade: h }, 201);
    }
    if (rota === '/disponibilidades') {
      if (perfil === 'responsavel') {
        assert.equal(url.searchParams.get('medicoId'), 'm');
      }
      return respostaLista(
        'disponibilidades',
        banco.horarios.filter((h) => perfil !== 'responsavel' || !h.ocupada)
      );
    }
    if (rota === '/agendamentos' && metodo === 'POST') {
      assert.equal(perfil, 'responsavel');
      if (banco.conflito) {
        return resposta({ message: 'Este horário já foi ocupado.' }, 409);
      }
      assert.equal(dados.disponibilidadeId, 'h');
      const h = banco.horarios[0];
      h.ocupada = true;
      const a = {
        _id: 'a',
        pacienteId: pacientes.find((p) => p._id === dados.pacienteId),
        medicoId: medico,
        instituicaoId: instituicao,
        disponibilidadeId: h,
        dataHora: h.inicio,
        status: 'pendente'
      };
      banco.agendamentos.push(a);
      return resposta({ agendamento: a }, 201);
    }
    if (rota === '/agendamentos/meus' || rota === '/agendamentos')
      return respostaLista('agendamentos', banco.agendamentos);
    if (rota === '/agendamentos/a') return resposta({ agendamento: banco.agendamentos[0] });
    if (rota === '/agendamentos/a/status') {
      assert.equal(metodo, 'PATCH');
      banco.agendamentos[0].status = dados.status;
      if (dados.motivo) banco.agendamentos[0].motivo = dados.motivo;
      return resposta({ agendamento: banco.agendamentos[0] });
    }
    if (rota === '/gestores' || rota === '/admins') return respostaLista(rota.slice(1), []);
    if (rota === '/pacientes') return respostaLista('data', pacientes);
    return resposta({ message: 'Rota inesperada: ' + rota }, 404);
  };
  return { banco, servir };
}
function datas() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  const dia = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
  return [dia + 'T10:00', dia + 'T10:30'];
}
async function solicitar(app) {
  await app.ir('buscar');
  await app.clique('button', 'Ver horários');
  await esperar(() => app.d.querySelector('input[type=radio]'), 'lista de horários');
  app.campo('select[name=paciente]', 'p2');
  app.d.querySelector('input[type=radio]').click();
  await app.clique('button', 'Revisar solicitação');
  await app.tela('dd', 'Paciente Dois');
  await app.clique('button', 'Enviar solicitação');
}
test('médico publica, família escolhe o segundo paciente, gestor confirma e família acompanha', async (t) => {
  const { banco, servir } = base();
  const medicoApp = await aplicativo(servir);
  t.after(medicoApp.fechar);
  await medicoApp.login('medico');
  await medicoApp.ir('horarios');
  await medicoApp.clique('button', 'Novo horário');
  const [inicio, fim] = datas();
  medicoApp.campo('[name=inicio]', inicio);
  medicoApp.campo('[name=fim]', fim);
  await medicoApp.clique('button', 'Publicar horário');
  await medicoApp.tela('p', 'Horário publicado.');
  assert.equal(banco.horarios[0].inicio, new Date(inicio).toISOString());
  const familia = await aplicativo(servir);
  t.after(familia.fechar);
  await familia.login('responsavel');
  await solicitar(familia);
  await familia.tela('h2', 'Solicitação enviada');
  assert.equal(banco.agendamentos[0].status, 'pendente');
  const post = banco.chamadas.find((c) => c.rota === '/agendamentos' && c.metodo === 'POST');
  assert.deepEqual(post.dados, { pacienteId: 'p2', disponibilidadeId: 'h' });
  const gestor = await aplicativo(servir);
  t.after(gestor.fechar);
  await gestor.login('gestor');
  await gestor.ir('agendamentos');
  await gestor.clique('button', 'Ver detalhes');
  await gestor.clique('button', 'Confirmar atendimento');
  await gestor.clique('button', 'Sim, continuar');
  await gestor.tela('span.estado', 'Confirmado');
  await familia.clique('a', 'Ver meus agendamentos');
  await familia.tela('span.estado', 'Confirmado');
  await familia.clique('button', 'Ver detalhes');
  await familia.tela('dd', 'Paciente Dois');
  assert.equal(familia.d.querySelectorAll('button').length > 0, true);
  assert.deepEqual([...medicoApp.problemas, ...familia.problemas, ...gestor.problemas], []);
});
test('HTTP 409 devolve a família à escolha e não exibe confirmação', async (t) => {
  const { banco, servir } = base();
  const [a, b] = datas();
  banco.horarios.push({
    _id: 'h',
    inicio: new Date(a).toISOString(),
    fim: new Date(b).toISOString(),
    ativo: true,
    medicoId: medico
  });
  banco.conflito = true;
  const app = await aplicativo(servir, 'responsavel', '/inicio');
  t.after(app.fechar);
  await app.tela('h1', 'Olá, responsavel.');
  await solicitar(app);
  await app.tela('[role=alert]', 'Este horário já foi ocupado.');
  assert.equal(app.d.querySelector('.sucesso'), null);
  assert.equal(banco.agendamentos.length, 0);
});
test('cadastro conjunto envia somente os campos da API e retorna ao login', async (t) => {
  const { banco, servir } = base(),
    app = await aplicativo(servir);
  t.after(app.fechar);
  await app.clique('a', 'Criar conta');
  await app.tela('h2', 'Criar conta da família');
  for (const [n, v] of Object.entries({
    usuario: 'teste.familia',
    senha: 'uma-senha-ficticia',
    confirmacao: 'uma-senha-ficticia',
    adulto: 'Adulto Exemplo',
    telefone: '(81) 99999-0000',
    crianca: 'Criança Exemplo',
    nascimento: '2020-09-13'
  }))
    app.campo('[name=' + n + ']', v);
  await app.clique('button', 'Criar conta');
  await app.tela('h2', 'Entrar no TeaSaude');
  assert.deepEqual(
    Object.keys(banco.cadastros[0]).sort(),
    [
      'nomeUsuario',
      'senha',
      'telefoneContato',
      'nomeContato',
      'nomeCompleto',
      'dataNascimento'
    ].sort()
  );
  assert.equal(banco.cadastros[0].telefoneContato, '81999990000');
  assert.equal(app.w.sessionStorage.length, 0);
});
test('rotas são restritas pelo perfil verificado no /me; sair apaga o token', async (t) => {
  const { servir, banco } = base(),
    app = await aplicativo(servir, 'medico', '/contas');
  t.after(app.fechar);
  await app.tela('h1', 'Olá, medico.');
  assert.equal(app.d.querySelector('aside nav a[href$="contas"]'), null);
  assert.equal(
    banco.chamadas.some((c) => c.rota === '/gestores'),
    false
  );
  await app.clique('button', 'Sair da conta');
  await app.tela('h2', 'Entrar no TeaSaude');
  assert.equal(app.w.sessionStorage.length, 0);
});
test('uma sessão expirada exige novo login sem reter o perfil', async (t) => {
  const { servir, banco } = base();
  banco.expirado = true;
  const app = await aplicativo(servir, 'gestor', '/agendamentos');
  t.after(app.fechar);
  await app.tela('h2', 'Entrar no TeaSaude');
  assert.equal(app.w.sessionStorage.length, 0);
  assert.equal(app.d.querySelector('aside.lateral'), null);
  assert.ok(!banco.chamadas.some((c) => c.rota === '/agendamentos'));
});
test('administrador alterna contas de gestores e administradores sem confundir as listas', async (t) => {
  const { servir, banco } = base();
  const app = await aplicativo(servir, 'admin', '/contas');
  t.after(app.fechar);
  await app.tela('p', 'Nenhuma conta encontrada.');
  await app.clique('button', 'Administradores');
  await app.tela('h2', 'Administradores');
  await esperar(() => banco.chamadas.some((c) => c.rota === '/admins'));
  assert.ok(banco.chamadas.some((c) => c.rota === '/gestores'));
  assert.deepEqual(app.problemas, []);
});
test('data fora da idade de cadastro indica o campo, permite corrigir e não envia antes da correção', async (t) => {
  const { banco, servir } = base(),
    app = await aplicativo(servir);
  t.after(app.fechar);
  await app.clique('a', 'Criar conta');
  await app.tela('h2', 'Criar conta da família');
  for (const [n, v] of Object.entries({
    usuario: 'amostra',
    senha: 'uma-senha-ficticia',
    confirmacao: 'uma-senha-ficticia',
    adulto: 'Adulto Exemplo',
    telefone: '81999990000',
    crianca: 'Paciente Exemplo',
    nascimento: '1980-01-01'
  }))
    app.campo('[name=' + n + ']', v);
  await app.clique('button', 'Criar conta');
  await esperar(() => app.d.activeElement?.name === 'nascimento', 'foco no campo de nascimento');
  assert.equal(app.d.activeElement.getAttribute('aria-invalid'), 'true');
  assert.equal(banco.cadastros.length, 0);
  app.campo('[name=nascimento]', '2020-01-01');
  assert.equal(app.d.activeElement.hasAttribute('aria-invalid'), false);
  await app.clique('button', 'Criar conta');
  await app.tela('h2', 'Entrar no TeaSaude');
  assert.equal(banco.cadastros.length, 1);
});
