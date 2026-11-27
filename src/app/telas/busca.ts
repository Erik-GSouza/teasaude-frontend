import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Tela } from '../tela';
import { Aviso, Icone } from '../ui';
import { Agendamento, Horario, Medico, Paciente, dataHora, hora, instituicao } from '../modelos';
import { ErroApi } from '../conexao';
@Component({ imports: [FormsModule, RouterLink, Aviso, Icone], templateUrl: './busca.html' })
export class Busca extends Tela {
  profissionais: Medico[] = [];
  pacientes: Paciente[] = [];
  horarios: Horario[] = [];
  medico?: Medico;
  slot?: Horario;
  selecionado = '';
  paciente = '';
  filtro = '';
  modalidade = '';
  motivo = '';
  plano = '';
  passo = 1;
  enviado = false;
  dataHora = dataHora;
  hora = hora;
  instituicao = instituicao;
  ngOnInit() {
    void this.atualizar();
  }
  atualizar() {
    return this.fazer(async () => {
      const [m, p] = await Promise.all([
        this.api.chamar<{ medicos: Medico[] }>('/medicos'),
        this.api.chamar<{ data: Paciente[] }>('/pacientes/meus')
      ]);
      this.profissionais = m.medicos;
      this.pacientes = p.data;
    });
  }
  get lista() {
    const f = this.filtro.toLocaleLowerCase().trim();
    return this.profissionais.filter((m) =>
      [m.nomeCompleto, m.especialidade, instituicao(m.instituicaoId)].some((s) =>
        s.toLocaleLowerCase().includes(f)
      )
    );
  }
  get nomePaciente() {
    return this.pacientes.find((p) => p._id === this.paciente)?.nomeCompleto;
  }
  async carregarHorarios(id: string) {
    this.horarios = (
      await this.api.chamar<{ disponibilidades: Horario[] }>(
        '/disponibilidades?medicoId=' + encodeURIComponent(id)
      )
    ).disponibilidades;
  }
  abrir(m: Medico) {
    return this.fazer(async () => {
      const { medico } = await this.api.chamar<{ medico: Medico }>('/medicos/' + m._id);
      this.medico = medico;
      this.passo = 2;
      this.horarios = [];
      this.selecionado = '';
      this.paciente = this.pacientes.length === 1 ? this.pacientes[0]._id : '';
      this.modalidade = '';
      this.motivo = '';
      this.plano = '';
      await this.carregarHorarios(m._id);
      this.focar('titulo-profissional');
    });
  }
  revisar() {
    this.erro = '';
    this.slot = this.horarios.find((h) => h._id === this.selecionado);
    if (!this.slot || !this.nomePaciente) {
      this.erro = 'Selecione um paciente e um horário disponível.';
      return;
    }
    this.passo = 3;
    this.focar('titulo-revisao');
  }
  enviar() {
    return this.fazer(async () => {
      if (!this.medico || !this.slot || !this.nomePaciente) return;
      const dados = {
        pacienteId: this.paciente,
        disponibilidadeId: this.slot._id,
        ...(this.modalidade ? { modalidade: this.modalidade } : {}),
        ...(this.motivo.trim() ? { motivo: this.motivo.trim() } : {}),
        ...(this.plano.trim() ? { plano: this.plano.trim() } : {})
      };
      try {
        await this.api.chamar<{ agendamento: Agendamento }>('/agendamentos', 'POST', dados);
      } catch (e) {
        if (e instanceof ErroApi && e.status === 409) {
          this.passo = 2;
          this.selecionado = '';
          this.slot = undefined;
          await this.carregarHorarios(this.medico._id);
        }
        throw e;
      }
      this.enviado = true;
      this.passo = 4;
      this.focar('titulo-enviada');
    });
  }
  voltar() {
    if (this.passo === 3) this.passo = 2;
    else this.passo = 1;
    this.focar(this.passo === 2 ? 'titulo-profissional' : 'titulo-busca');
    this.erro = '';
    this.mensagem = '';
  }
}
