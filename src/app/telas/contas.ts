import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tela } from '../tela';
import { Aviso, Icone } from '../ui';
import { Medico, Usuario, idDe, instituicao, validarCredenciais } from '../modelos';
@Component({ imports: [FormsModule, Aviso, Icone], templateUrl: './contas.html' })
export class Contas extends Tela {
  tipo: 'gestores' | 'admins' = 'gestores';
  lista: Usuario[] = [];
  medicos: Medico[] = [];
  filtro = '';
  modo = '';
  alvo?: Usuario;
  nome = '';
  senha = '';
  instituicaoId = '';
  idDe = idDe;
  get gestor() {
    return this.tipo === 'gestores';
  }
  get descricao() {
    return this.gestor ? 'gestor' : 'administrador';
  }
  get opcoes() {
    return [
      ...new Map(
        this.medicos.map((m) => [idDe(m.instituicaoId), instituicao(m.instituicaoId)])
      ).entries()
    ].filter((v) => v[0]);
  }
  get visiveis() {
    return this.lista.filter((u) =>
      u.nomeUsuario.toLowerCase().includes(this.filtro.trim().toLowerCase())
    );
  }
  ngOnInit() {
    void this.atualizar();
  }
  async listar() {
    const r = await this.api.chamar<{ gestores?: Usuario[]; admins?: Usuario[] }>('/' + this.tipo);
    this.lista = r.gestores || r.admins || [];
  }
  atualizar() {
    return this.fazer(async () => {
      await this.listar();
      if (this.gestor)
        this.medicos = (await this.api.chamar<{ medicos: Medico[] }>('/medicos')).medicos;
    });
  }
  trocar(t: 'gestores' | 'admins') {
    if (this.carregando) return;
    this.tipo = t;
    this.lista = [];
    this.modo = '';
    this.alvo = undefined;
    this.senha = '';
    this.filtro = '';
    void this.atualizar();
  }
  editar(u?: Usuario) {
    this.modo = 'editar';
    this.alvo = u;
    this.nome = u?.nomeUsuario || '';
    this.senha = '';
    this.instituicaoId = idDe(u?.instituicaoId);
    this.erro = '';
    this.mensagem = '';
    setTimeout(() => document.getElementById('nome-conta')?.focus());
  }
  salvar() {
    return this.fazer(async () => {
      const nomeUsuario = this.nome.trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,30}$/.test(nomeUsuario))
        throw new Error('Use de 3 a 30 letras, números, pontos, traços ou sublinhados no usuário.');
      if (!this.alvo) {
        const e = validarCredenciais(nomeUsuario, this.senha);
        if (e) throw new Error(e);
      }
      if (this.gestor && !/^[\da-f]{24}$/i.test(this.instituicaoId.trim()))
        throw new Error('Informe o ID de uma instituição existente.');
      await this.api.chamar(
        '/' + this.tipo + (this.alvo ? '/' + this.alvo._id : ''),
        this.alvo ? 'PATCH' : 'POST',
        {
          nomeUsuario,
          ...(!this.alvo ? { senha: this.senha } : {}),
          ...(this.gestor ? { instituicaoId: this.instituicaoId.trim() } : {})
        }
      );
      this.senha = '';
      this.modo = '';
      this.mensagem = 'Conta salva.';
      await this.listar();
    });
  }
  alterar() {
    return this.fazer(async () => {
      if (!this.alvo) return;
      const u = this.alvo,
        desativarGestor = this.gestor && u.ativo;
      await this.api.chamar(
        '/' + this.tipo + '/' + u._id,
        desativarGestor ? 'DELETE' : 'PATCH',
        desativarGestor ? undefined : { ativo: !u.ativo }
      );
      this.modo = '';
      this.mensagem = 'Situação da conta atualizada.';
      await this.listar();
    });
  }
}
