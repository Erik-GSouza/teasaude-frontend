import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Tela } from '../tela';
import { Aviso } from '../ui';
import {
  Agendamento,
  Status,
  dataHora,
  hora,
  opcoesStatus,
  precisaMotivo,
  situacoes
} from '../modelos';
@Component({ imports: [FormsModule, Aviso, RouterLink], templateUrl: './agenda.html' })
export class Agenda extends Tela {
  registros: Agendamento[] = [];
  filtro = '';
  detalhe?: Agendamento;
  destino?: Status;
  motivo = '';
  dataHora = dataHora;
  hora = hora;
  situacoes = situacoes;
  opcoes = Object.keys(situacoes) as Status[];
  opcoesStatus = opcoesStatus;
  precisaMotivo = precisaMotivo;
  verbos: Record<Status, string> = {
    pendente: 'Aguardar',
    agendada: 'Confirmar atendimento',
    recusada: 'Recusar solicitação',
    cancelada: 'Cancelar agendamento',
    concluida: 'Concluir atendimento'
  };
  get familia() {
    return this.perfil === 'responsavel';
  }
  get lista() {
    return this.registros.filter((a) => !this.filtro || a.status === this.filtro);
  }
  async listar() {
    const r = await this.api.chamar<{ agendamentos: Agendamento[] }>(
      this.familia ? '/agendamentos/meus' : '/agendamentos'
    );
    this.registros = r.agendamentos;
  }
  atualizar() {
    return this.fazer(() => this.listar());
  }
  ngOnInit() {
    void this.atualizar();
  }
  abrir(a: Agendamento) {
    return this.fazer(async () => {
      this.destino = undefined;
      this.motivo = '';
      this.detalhe = (
        await this.api.chamar<{ agendamento: Agendamento }>('/agendamentos/' + a._id)
      ).agendamento;
      setTimeout(() => document.getElementById('titulo-detalhe')?.focus());
    });
  }
  fechar() {
    this.destino = undefined;
    this.detalhe = undefined;
    this.erro = '';
  }
  salvar() {
    return this.fazer(async () => {
      if (!this.detalhe || !this.destino) return;
      const s = this.destino;
      const m = this.motivo.trim();
      if (precisaMotivo(s, this.perfil) && !m) throw new Error('Descreva o motivo da decisão.');
      const r = await this.api.chamar<{ agendamento: Agendamento }>(
        '/agendamentos/' + this.detalhe._id + '/status',
        'PATCH',
        { status: s, ...(m ? { motivo: m } : {}) }
      );
      this.detalhe = r.agendamento;
      this.destino = undefined;
      this.registros = this.registros.map((a) => (a._id === r.agendamento._id ? r.agendamento : a));
      this.mensagem = 'Situação atualizada: ' + situacoes[s] + '.';
    });
  }
}
