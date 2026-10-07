# TeaSaude — Frontend

Interface web do Projeto Integrador TeaSaude, voltado à busca e ao agendamento de atendimentos para crianças e adolescentes neurodivergentes ou em avaliação, em instituições privadas.

## Repositório

* [Backend](https://github.com/Erik-GSouza/teasaude-backend)

## Objetivo

Reunir opções de atendimento, informações sobre planos aceitos fornecidas pelas instituições e acompanhamento de solicitações de agendamento.

No MVP, um adulto utiliza uma conta vinculada a um paciente. O público contempla crianças e adolescentes, do nascimento até os 17 anos. O nome TeaSaude é provisório e não restringe o público somente a pessoas com TEA.

## Tecnologias

* HTML
* CSS
* JavaScript
* Bootstrap Icons
* Comunicação com uma API REST em Node.js e Express
* Banco MongoDB/Mongoose no backend

## Perfis e funcionalidades planejadas

| Perfil | Participação no MVP |
| --- | --- |
| Paciente/responsável | Adulto opera uma conta vinculada a um único paciente. Consulta seus dados, atendimentos, solicitações e agendamentos. |
| Gestor | Administra dados e operações relacionadas à própria instituição, conforme as permissões disponibilizadas pela API. |
| Admin | Administração global do sistema conforme as permissões disponibilizadas pela API. |
| Profissional | Registro vinculado à instituição e aos atendimentos, sem login próprio neste recorte. |                                  |

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

## Estrutura atual

```text
teasaude-frontend/
├── index.html
├── README.md
│
└── src/
    ├── css/
    │   ├── base.css
    │   ├── layout.css
    │   │
    │   ├── auth/
    │   │   ├── login.css
    │   │   └── criar-conta.css
    │   │
    │   ├── paciente/
    │   │   └── cadastro.css
    │   │
    │   ├── gestor/
    │   │   └── solicitacoes.css
    │   │
    │   └── admin/
    │       └── administracao.css
    │
    ├── js/
    │   ├── layout.js
    │   │
    │   ├── auth/
    │   │   ├── login.js
    │   │   └── criar-conta.js
    │   │
    │   ├── paciente/
    │   │   └── cadastro.js
    │   │
    │   ├── gestor/
    │   │   └── solicitacoes.js
    │   │
    │   └── admin/
    │       └── administracao.js
    │
    └── pages/
        ├── auth/
        │   └── criar-conta.html
        │
        ├── paciente/
        │   └── cadastro.html
        │
        ├── gestor/
        │   └── solicitacoes.html
        │
        └── admin/
            └── administracao.html
```

Acrescentar `src/pages/` quando houver outras páginas. `src/services/` para comunicação com a API. `src/assets/` para imagens e ícones.

| Frente               | Integrantes              | 
| -------------------- | ------------------------ |
| Frontend             | Erik, Hállefe e Matheus  | 
| Backend/banco        | Alison, Bárbara e Cid    |


