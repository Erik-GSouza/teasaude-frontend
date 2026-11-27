import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tela } from '../tela';
import { Aviso, Icone } from '../ui';
import { Horario, Medico, dataHora, hora, inputHora, dadosHorario } from '../modelos';
@Component({ imports: [FormsModule, Aviso, Icone], templateUrl: './horarios.html' })
export class Horarios extends Tela {
  horarios: Horario[] = [];
  medicos: Medico[] = [];
  medicoFiltro = '';
  estadoFiltro = 'futuros';
  form = false;
  id = '';
  medicoId = '';
  inicio = '';
  fim = '';
  alvo?: Horario;
  dataHora = dataHora;
  hora = hora;
  get proprio() {
    return this.perfil === 'medico';
  }
  get lista() {
    return this.horarios.filter(
      (h) =>
        (!this.medicoFiltro || this.idMedico(h) === this.medicoFiltro) &&
        (this.estadoFiltro === 'todos' ||
          (this.estadoFiltro === 'futuros'
            ? Date.parse(h.inicio) > Date.now()
            : this.estadoFiltro === 'livres'
              ? h.ativo && !h.ocupada && Date.parse(h.inicio) > Date.now()
              : this.estadoFiltro === 'ocupados'
                ? h.ocupada
                : !h.ativo))
    );
  }
  idMedico(h: Horario) {
    return typeof h.medicoId === 'string' ? h.medicoId : h.medicoId?._id || '';
  }
  nome(h: Horario) {
    return typeof h.medicoId === 'object' ? h.medicoId?.nomeCompleto : '';
  }
  ngOnInit() {
    void this.atualizar();
  }
  async listar() {
    this.horarios = (
      await this.api.chamar<{ disponibilidades: Horario[] }>('/disponibilidades')
    ).disponibilidades;
  }
  atualizar() {
    return this.fazer(async () => {
      if (!this.proprio)
        this.medicos = (await this.api.chamar<{ medicos: Medico[] }>('/medicos')).medicos;
      await this.listar();
    });
  }
  editar(h?: Horario) {
    this.form = true;
    this.alvo = undefined;
    this.id = h?._id || '';
    this.medicoId = h ? this.idMedico(h) : this.medicoFiltro;
    this.inicio = h ? inputHora(h.inicio) : '';
    this.fim = h ? inputHora(h.fim) : '';
    this.erro = '';
    this.mensagem = '';
    setTimeout(() => document.getElementById('inicio-horario')?.focus());
  }
  salvar() {
    return this.fazer(async () => {
      const datas = dadosHorario(this.inicio, this.fim);
      if (!this.id && !this.proprio && !this.medicoId) throw new Error('Escolha um profissional.');
      await this.api.chamar(
        '/disponibilidades' + (this.id ? '/' + this.id : ''),
        this.id ? 'PATCH' : 'POST',
        { ...datas, ...(!this.id && !this.proprio ? { medicoId: this.medicoId } : {}) }
      );
      this.mensagem = this.id ? 'Horário atualizado.' : 'Horário publicado.';
      this.form = false;
      await this.listar();
    });
  }
  alterar() {
    return this.fazer(async () => {
      if (!this.alvo) return;
      const ativo = !this.alvo.ativo;
      await this.api.chamar('/disponibilidades/' + this.alvo._id, 'PATCH', { ativo });
      this.alvo = undefined;
      this.mensagem = ativo ? 'Horário reativado.' : 'Horário desativado.';
      await this.listar();
    });
  }
  futuro(h: Horario) {
    return Date.parse(h.inicio) > Date.now();
  }
}
