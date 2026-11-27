import { Perfil } from './modelos';
type Item = { rota: string; nome: string; curto: string; icone: string; perfis: Perfil[] };
export const todos: Perfil[] = ['responsavel', 'medico', 'gestor', 'admin'];
export const menu: Item[] = [
  { rota: 'inicio', nome: 'Início', curto: 'Início', icone: 'inicio', perfis: todos },
  {
    rota: 'buscar',
    nome: 'Buscar atendimento',
    curto: 'Buscar',
    icone: 'busca',
    perfis: ['responsavel']
  },
  {
    rota: 'agendamentos',
    nome: 'Agendamentos',
    curto: 'Agenda',
    icone: 'agenda',
    perfis: ['responsavel', 'gestor', 'admin']
  },
  {
    rota: 'pacientes',
    nome: 'Pacientes',
    curto: 'Pacientes',
    icone: 'pessoas',
    perfis: ['responsavel', 'admin']
  },
  {
    rota: 'horarios',
    nome: 'Disponibilidades',
    curto: 'Horários',
    icone: 'hora',
    perfis: ['medico', 'gestor', 'admin']
  },
  {
    rota: 'profissionais',
    nome: 'Profissionais',
    curto: 'Equipe',
    icone: 'profissional',
    perfis: ['gestor', 'admin']
  },
  { rota: 'contas', nome: 'Contas de acesso', curto: 'Contas', icone: 'chave', perfis: ['admin'] }
];
export function nomeMenu(rota: string, perfil: Perfil, nome: string) {
  return rota === 'pacientes' && perfil === 'responsavel'
    ? 'Minha família'
    : rota === 'agendamentos' && perfil === 'gestor'
      ? 'Solicitações e agenda'
      : nome;
}
