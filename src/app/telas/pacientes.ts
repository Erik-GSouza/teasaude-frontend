import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tela } from '../tela';
import { Paciente, dataCivil, inputData, validarPaciente } from '../modelos';
import { Aviso, Icone } from '../ui';
@Component({ imports: [FormsModule, Aviso, Icone], templateUrl: './pacientes.html' })
export class Pacientes extends Tela {
  lista: Paciente[] = [];
  filtro = '';
  editando = false;
  id = '';
  nome = '';
  nascimento = '';
  excluir?: Paciente;
  hoje = inputData();
  dataCivil = dataCivil;
  get admin() {
    return this.perfil === 'admin';
  }
  get rota() {
    return this.admin ? '/pacientes' : '/pacientes/meus';
  }
  get visiveis() {
    return this.lista.filter((p) =>
      p.nomeCompleto.toLocaleLowerCase().includes(this.filtro.toLocaleLowerCase().trim())
    );
  }
  ngOnInit() {
    void this.atualizar();
  }
  async listar() {
    this.lista = (await this.api.chamar<{ data: Paciente[] }>(this.rota)).data;
  }
  atualizar() {
    return this.fazer(() => this.listar());
  }
  editar(p?: Paciente) {
    this.excluir = undefined;
    this.id = p?._id || '';
    this.nome = p?.nomeCompleto || '';
    this.nascimento = p?.dataNascimento.slice(0, 10) || '';
    this.editando = true;
    this.erro = '';
    this.mensagem = '';
    setTimeout(() => document.getElementById('nome-paciente')?.focus());
  }
  salvar() {
    return this.fazer(async () => {
      const erro = validarPaciente(this.nome, this.nascimento, !this.id);
      if (erro) this.campoInvalido(this.nome.trim().length < 3 ? 'nome' : 'nasc', erro);
      await this.api.chamar(
        this.id ? this.rota + '/' + this.id : '/pacientes',
        this.id ? 'PATCH' : 'POST',
        { nomeCompleto: this.nome.trim(), dataNascimento: this.nascimento }
      );
      this.editando = false;
      this.mensagem = 'Cadastro salvo.';
      await this.listar();
    });
  }
  remover() {
    return this.fazer(async () => {
      if (!this.admin || !this.excluir) return;
      await this.api.chamar('/pacientes/' + this.excluir._id, 'DELETE');
      this.excluir = undefined;
      this.mensagem = 'Paciente excluído.';
      await this.listar();
    });
  }
  contato(p: Paciente) {
    return typeof p.responsavelId === 'object' ? p.responsavelId : null;
  }
}
