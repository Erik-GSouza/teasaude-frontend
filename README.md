# TeaSaude — Frontend

Interface web do Projeto Integrador TeaSaude, voltado à busca e ao agendamento de atendimentos para crianças e adolescentes neurodivergentes ou em avaliação, em instituições privadas.

**Este README descreve o trabalho planejado para a interface.** sua implementação e integração ainda não foram verificadas. Atualizar o estágio e os itens concluídos conforme o desenvolvimento real.

## Repositório

* [Backend](https://github.com/Erik-GSouza/teasaude-backend)

## Objetivo

Reunir opções de atendimento, informações sobre planos aceitos fornecidas pelas instituições e acompanhamento de solicitações de agendamento.

No MVP, um adulto utiliza uma conta vinculada a um paciente. O público contempla crianças e adolescentes, do nascimento até os 17 anos. O nome TeaSaude é provisório e não restringe o público somente a pessoas com TEA.

## Tecnologias previstas

* HTML
* CSS próprio
* JavaScript puro
* Bootstrap via CDN
* Comunicação com uma API REST em Node.js e Express
* Banco MongoDB com Mongoose no backend

O Bootstrap será utilizado para auxiliar na organização das páginas, responsividade, formulários, botões e componentes visuais básicos.

## Perfis e funcionalidades planejadas

| Perfil       | Participação no MVP                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Paciente     | Conta operada pelo adulto; cadastro, consulta de atendimentos, solicitações e acompanhamento dos próprios agendamentos.   |
| Gestor       | Administração dos dados, profissionais, serviços, planos aceitos, disponibilidades e solicitações da própria instituição. |
| Profissional | Registro vinculado à instituição e aos atendimentos, inicialmente sem login próprio.                                      |

## Regras de funcionamento aceitas

* Uma conta por paciente, sem separação do Responsável.
* Agendamento por solicitação, confirmada ou recusada pelo gestor.
* Solicitação pendente reserva a vaga; a API deve impedir reservas concorrentes.
* Estados previstos: pendente, confirmada, realizada, cancelada e recusada.
* Cada sessão será agendada individualmente.
* Paciente pode retirar uma solicitação pendente para um horário futuro.
* Para atendimentos confirmados, cancelamento direto com pelo menos 24 horas de antecedência. Dentro desse prazo, orientar contato com a clínica.
* Gestor pode cancelar atendimentos futuros pendentes ou confirmados, informando o motivo.
* Remarcação será feita por cancelamento e nova solicitação, sem preservar a vaga anterior.
* Orientações sobre documentos são informadas pela instituição. Não haverá upload nem formulário específico de laudo nesta versão.
* Primeira avaliação pode ser buscada e solicitada sem um laudo previamente cadastrado.
* Planos aceitos são informações mantidas pelo gestor; sua exibição não confirma cobertura individual.

## Estrutura proposta

Criar primeiro os quatro arquivos abaixo, após conferir o conteúdo atual do repositório.

| Caminho              | Finalidade                                                   |
| -------------------- | ------------------------------------------------------------ |
| `README.md`          | Documentação do repositório.                                 |
| `index.html`         | Página inicial de trabalho com o formulário de Paciente.     |
| `src/css/styles.css` | Cores, ajustes visuais próprios e complementos ao Bootstrap. |
| `src/js/main.js`     | Comportamento da página e validações da interface.           |

Acrescentar `src/pages/` quando houver outras páginas. `src/services/` para comunicação com a API. `src/assets/` para imagens e ícones.

| Frente               | Integrantes              | 
| -------------------- | ------------------------ |
| Frontend             | Erik, Hállefe e Matheus  | 
| Backend/banco        | Alison, Bárbara e Cid    |
