import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tela } from '../tela';
import { Aviso, Icone } from '../ui';
import { Medico, idDe, instituicao, validarCredenciais } from '../modelos';
@Component({ imports: [FormsModule, Aviso, Icone], templateUrl: './profissionais.html' })
export class Profissionais extends Tela {
  lista: Medico[] = [];
  instituicao = instituicao;
  busca = '';
  idBusca = '';
  id = '';
  nome = '';
  especialidade = '';
  modalidades = '';
  orientacoes = '';
  instituicaoId = '';
  modo = '';
  alvo?: Medico;
  usuario = '';
  senha = '';
  get admin() {
    return this.perfil === 'admin';
  }
  get visiveis() {
    const q = this.busca.trim().toLowerCase();
    return this.lista.filter((m) =>
      (m.nomeCompleto + ' ' + m.especialidade).toLowerCase().includes(q)
    );
  }
  get instituicoes() {
    return [
      ...new Map(
        this.lista.map((m) => [idDe(m.instituicaoId), instituicao(m.instituicaoId)])
      ).entries()
    ].filter((v) => v[0]);
  }
  ngOnInit() {
    void this.atualizar();
  }
  async listar() {
    this.lista = (await this.api.chamar<{ medicos: Medico[] }>('/medicos')).medicos;
  }
  atualizar() {
    return this.fazer(() => this.listar());
  }
  editar(m?: Medico) {
    this.alvo = m;
    this.modo = 'editar';
    this.id = m?._id || '';
    this.nome = m?.nomeCompleto || '';
    this.especialidade = m?.especialidade || '';
    this.modalidades = m?.modalidades?.join(', ') || '';
    this.orientacoes = m?.orientacoesDocumentos || '';
    this.instituicaoId = idDe(m?.instituicaoId);
    this.erro = '';
    this.mensagem = '';
    setTimeout(() => document.getElementById('nome-profissional')?.focus());
  }
  buscarId() {
    return this.fazer(async () => {
      const id = this.idBusca.trim();
      if (!/^[\da-f]{24}$/i.test(id))
        throw new Error('Informe um ID de profissional válido (24 caracteres).');
      const { medico } = await this.api.chamar<{ medico: Medico }>('/medicos/' + id);
      this.editar(medico);
    });
  }
  salvar() {
    return this.fazer(async () => {
      if (this.nome.trim().length < 3 || this.especialidade.trim().length < 3)
        throw new Error('Nome e especialidade precisam ter pelo menos 3 caracteres.');
      if (!this.id && this.admin && !/^[\da-f]{24}$/i.test(this.instituicaoId.trim()))
        throw new Error('Informe o ID de uma instituição existente.');
      const dados = {
        nomeCompleto: this.nome.trim(),
        especialidade: this.especialidade.trim(),
        modalidades: this.modalidades
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        orientacoesDocumentos: this.orientacoes.trim(),
        ...(!this.id && this.admin ? { instituicaoId: this.instituicaoId.trim() } : {})
      };
      await this.api.chamar(
        '/medicos' + (this.id ? '/' + this.id : ''),
        this.id ? 'PATCH' : 'POST',
        dados
      );
      this.modo = '';
      this.mensagem = 'Cadastro profissional salvo.';
      await this.listar();
    });
  }
  acao(m: Medico, modo: string) {
    this.alvo = m;
    this.modo = modo;
    this.usuario = '';
    this.senha = '';
    this.erro = '';
    this.mensagem = '';
  }
  alterar() {
    return this.fazer(async () => {
      if (!this.alvo) return;
      await this.api.chamar('/medicos/' + this.alvo._id, 'PATCH', { ativo: !this.alvo.ativo });
      this.modo = '';
      this.mensagem = 'Situação do profissional atualizada.';
      await this.listar();
    });
  }
  vincular() {
    return this.fazer(async () => {
      if (!this.alvo || !this.admin) return;
      const e = validarCredenciais(this.usuario, this.senha);
      if (e) throw new Error(e);
      await this.api.chamar('/medicos/' + this.alvo._id + '/conta', 'POST', {
        nomeUsuario: this.usuario.trim().toLowerCase(),
        senha: this.senha
      });
      this.senha = '';
      this.modo = '';
      this.mensagem = 'Conta médica vinculada. O profissional já pode entrar.';
    });
  }
}
