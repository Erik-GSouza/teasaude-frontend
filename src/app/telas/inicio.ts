import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tela } from '../tela';
import { Agendamento, Horario, Paciente, dataHora, perfis, situacoes } from '../modelos';
import { menu, nomeMenu } from '../navegacao';
import { Icone, Aviso } from '../ui';
@Component({ imports: [RouterLink, Icone, Aviso], templateUrl: './inicio.html' })
export class Inicio extends Tela {
  perfis = perfis;
  dataHora = dataHora;
  situacoes = situacoes;
  nomeMenu = nomeMenu;
  proximo?: Agendamento;
  resumo = '';
  hoje = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date());
  get atalhos() {
    return menu.filter((m) => m.rota !== 'inicio' && m.perfis.includes(this.perfil));
  }
  get primeiroNome() {
    const u = this.api.usuario();
    return (u?.nomeCompleto || u?.nomeUsuario || '').split(' ')[0];
  }
  descricoes: Record<string, string> = {
    buscar: 'Escolha um profissional e consulte os horários.',
    agendamentos: 'Acompanhe solicitações e decisões.',
    pacientes: 'Consulte cadastros e informações dos pacientes.',
    horarios: 'Publique e organize os horários livres.',
    profissionais: 'Mantenha os cadastros da equipe.',
    contas: 'Gerencie acessos de gestores e administradores.'
  };
  ngOnInit() {
    void this.atualizar();
  }
  atualizar() {
    return this.fazer(async () => {
      if (this.perfil === 'medico') {
        const h = (await this.api.chamar<{ disponibilidades: Horario[] }>('/disponibilidades'))
          .disponibilidades;
        const livres = h.filter((i) => i.ativo && !i.ocupada && Date.parse(i.inicio) > Date.now());
        this.resumo = livres.length + ' horário(s) livre(s) no futuro.';
        return;
      }
      const familia = this.perfil === 'responsavel';
      const { agendamentos } = await this.api.chamar<{ agendamentos: Agendamento[] }>(
        familia ? '/agendamentos/meus' : '/agendamentos'
      );
      this.proximo = agendamentos
        .filter((a) => a.status === 'agendada' && Date.parse(a.dataHora) > Date.now())
        .sort((a, b) => Date.parse(a.dataHora) - Date.parse(b.dataHora))[0];
      const pendentes = agendamentos.filter((a) => a.status === 'pendente').length;
      this.resumo =
        pendentes === 1
          ? '1 solicitação aguardando resposta.'
          : pendentes + ' solicitações aguardando resposta.';
      if (familia) {
        const { data } = await this.api.chamar<{ data: Paciente[] }>('/pacientes/meus');
        this.resumo +=
          ' ' +
          (data.length === 1 ? 'Paciente: ' : 'Pacientes: ') +
          (data.map((p) => p.nomeCompleto).join(', ') || 'nenhum cadastrado') +
          '.';
      }
    });
  }
}
