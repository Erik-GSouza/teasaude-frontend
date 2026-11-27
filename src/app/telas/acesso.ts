import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Tela } from '../tela';
import { Aviso, Icone, Marca } from '../ui';
import { inputData, validarCredenciais, validarPaciente } from '../modelos';
import { requisicao } from '../conexao';
@Component({
  imports: [FormsModule, RouterLink, Aviso, Icone, Marca],
  templateUrl: './acesso.html'
})
export class Acesso extends Tela {
  rota = inject(ActivatedRoute);
  router = inject(Router);
  cadastro = this.rota.snapshot.routeConfig?.path === 'criar-conta';
  nomeUsuario = '';
  senha = '';
  confirma = '';
  mostrar = false;
  nomeContato = '';
  telefoneContato = '';
  emailContato = '';
  nomeCompleto = '';
  dataNascimento = '';
  hoje = inputData();
  constructor() {
    super();
    this.mensagem = this.api.aviso();
    this.api.aviso.set('');
  }
  enviar() {
    return this.fazer(async () => {
      const erro = validarCredenciais(this.nomeUsuario, this.senha, this.cadastro);
      if (erro) {
        const campo =
          !this.nomeUsuario.trim() ||
          (this.cadastro && !/^[a-z0-9._-]{3,30}$/.test(this.nomeUsuario.trim().toLowerCase()))
            ? 'usuario'
            : 'senha';
        this.campoInvalido(campo, erro);
      }
      if (this.cadastro) {
        if (this.senha !== this.confirma)
          this.campoInvalido('confirmacao', 'As senhas não coincidem.');
        if (this.nomeContato.trim().length < 3)
          this.campoInvalido(
            'adulto',
            'Informe o nome do responsável com pelo menos 3 caracteres.'
          );
        const tel = this.telefoneContato.replace(/\D/g, '');
        if (!/^\d{10,11}$/.test(tel) || !/^[\d\s().-]+$/.test(this.telefoneContato))
          this.campoInvalido('telefone', 'Informe um telefone com DDD e 10 ou 11 dígitos.');
        const erroPaciente = validarPaciente(this.nomeCompleto, this.dataNascimento, true);
        if (erroPaciente)
          this.campoInvalido(
            this.nomeCompleto.trim().length < 3 ? 'crianca' : 'nascimento',
            erroPaciente
          );
        await requisicao('/auth/cadastro', 'POST', {
          nomeUsuario: this.nomeUsuario.trim().toLowerCase(),
          senha: this.senha,
          nomeContato: this.nomeContato.trim(),
          telefoneContato: tel,
          ...(this.emailContato.trim() ? { emailContato: this.emailContato.trim() } : {}),
          nomeCompleto: this.nomeCompleto.trim(),
          dataNascimento: this.dataNascimento
        });
        this.api.aviso.set('Conta criada. Entre com seu nome de usuário e senha.');
        await this.router.navigateByUrl('/entrar');
      } else {
        await this.api.entrar(this.nomeUsuario, this.senha);
        await this.router.navigateByUrl('/inicio');
      }
    });
  }
}
