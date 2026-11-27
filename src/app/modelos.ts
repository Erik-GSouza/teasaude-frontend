export type Perfil = 'responsavel' | 'medico' | 'gestor' | 'admin';
export interface Instituicao {
  _id: string;
  nomePublico?: string;
}
export interface Usuario {
  _id: string;
  perfil: Perfil;
  nomeUsuario: string;
  ativo: boolean;
  nomeCompleto?: string;
  telefone?: string;
  email?: string;
  instituicaoId?: string | Instituicao | null;
}
export interface Paciente {
  _id: string;
  nomeCompleto: string;
  dataNascimento: string;
  responsavelId?: string | Usuario | null;
}
export interface Medico {
  _id: string;
  nomeCompleto: string;
  especialidade: string;
  instituicaoId: string | Instituicao | null;
  modalidades?: string[];
  orientacoesDocumentos?: string;
  ativo: boolean;
}
export interface Horario {
  _id: string;
  inicio: string;
  fim: string;
  ativo: boolean;
  ocupada?: boolean;
  medicoId: Medico | string | null;
}
export type Status = 'pendente' | 'agendada' | 'recusada' | 'cancelada' | 'concluida';
export interface Agendamento {
  _id: string;
  pacienteId: Paciente | null;
  medicoId: Medico | null;
  instituicaoId: Instituicao | null;
  disponibilidadeId: Horario | null;
  dataHora: string;
  status: Status;
  motivo?: string;
  modalidade?: string;
  plano?: string;
}
export const perfis: Record<Perfil, string> = {
  responsavel: 'Responsável',
  medico: 'Médico',
  gestor: 'Gestor',
  admin: 'Administrador'
};
export const situacoes: Record<Status, string> = {
  pendente: 'Aguardando resposta',
  agendada: 'Confirmado',
  recusada: 'Recusado',
  cancelada: 'Cancelado',
  concluida: 'Concluído'
};
export function instituicao(i: Medico['instituicaoId'] | undefined) {
  return (typeof i === 'object' && i?.nomePublico) || 'Instituição não informada';
}
export function idDe(i: Usuario['instituicaoId']) {
  return typeof i === 'string' ? i : i?._id || '';
}
export function dataHora(s?: string) {
  return s
    ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : 'Não informado';
}
export function hora(s: string) {
  return new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
export function dataCivil(s: string) {
  return s.slice(0, 10).split('-').reverse().join('/');
}
export function inputData(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}
export function inputHora(s: string) {
  const d = new Date(s);
  return (
    inputData(d) +
    'T' +
    [d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join(':')
  );
}
export function validarPaciente(nome: string, data: string, novo: boolean, hoje = new Date()) {
  if (nome.trim().length < 3) return 'Informe o nome do paciente com pelo menos 3 caracteres.';
  const d = new Date(data + 'T12:00:00');
  if (!data || Number.isNaN(d.valueOf()) || inputData(d) !== data || data > inputData(hoje))
    return 'Informe uma data de nascimento válida, até hoje.';
  const idade =
    hoje.getFullYear() - d.getFullYear() - (inputData(hoje).slice(5) < data.slice(5) ? 1 : 0);
  return novo && idade >= 18 ? 'O paciente deve ter menos de 18 anos no primeiro cadastro.' : '';
}
export function validarCredenciais(nome: string, senha: string, nova = true) {
  if (!nome.trim() || !senha) return 'Informe seu nome de usuário e sua senha.';
  if (nova && !/^[a-z0-9._-]{3,30}$/.test(nome.trim().toLowerCase()))
    return 'Use de 3 a 30 letras, números, pontos, traços ou sublinhados no usuário.';
  if (nova && ([...senha].length < 8 || new TextEncoder().encode(senha).length > 72))
    return 'Use uma senha com pelo menos 8 caracteres e até 72 bytes.';
  return '';
}
export function opcoesStatus(a: Agendamento, p: Perfil, agora = Date.now()): Status[] {
  const futuro = Date.parse(a.dataHora) > agora;
  if (p === 'medico') return [];
  if (p === 'responsavel')
    return futuro &&
      (a.status === 'pendente' ||
        (a.status === 'agendada' && Date.parse(a.dataHora) - agora >= 86400000))
      ? ['cancelada']
      : [];
  if (a.status === 'pendente' && futuro) return ['agendada', 'recusada', 'cancelada'];
  if (a.status === 'agendada' && futuro) return ['cancelada'];
  return a.status === 'agendada' &&
    a.disponibilidadeId?.fim &&
    Date.parse(a.disponibilidadeId.fim) <= agora
    ? ['concluida']
    : [];
}
export function precisaMotivo(s: Status, p: Perfil) {
  return s === 'recusada' || (s === 'cancelada' && p !== 'responsavel');
}
export function dadosHorario(inicio: string, fim: string, agora = Date.now()) {
  const a = new Date(inicio),
    b = new Date(fim);
  if (!Number.isFinite(+a) || !Number.isFinite(+b) || +a <= agora || +b <= +a)
    throw new Error('Escolha um início futuro e um término posterior ao início.');
  return { inicio: a.toISOString(), fim: b.toISOString() };
}
