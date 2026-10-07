document.addEventListener("DOMContentLoaded", function () {
    const navegacaoApp = document.querySelector("#navegacaoApp");

    if (!navegacaoApp) {return;}

    const perfil = navegacaoApp.dataset.perfil;
    const itemAtivo = navegacaoApp.dataset.itemAtivo;

    const menus = {
        paciente: [
            {
                id: "inicio",
                texto: "Início",
                icone: "bi-house"
            },
            {
                id: "buscar",
                texto: "Buscar atendimento",
                icone: "bi-search"
            },
            {
                id: "agendamentos",
                texto: "Meus agendamentos",
                icone: "bi-calendar3"
            },
            {
                id: "cadastro",
                texto: "Meu cadastro",
                icone: "bi-person"
            }
        ],

        gestor: [
            {
                id: "solicitacoes",
                texto: "Solicitações e agenda",
                icone: "bi-calendar-check"
            },
            {
                id: "disponibilidades",
                texto: "Disponibilidades",
                icone: "bi-clock"
            },
            {
                id: "cadastros",
                texto: "Cadastros da instituição",
                icone: "bi-building"
            }
        ],

        admin: [
            {
                id: "administracao",
                texto: "Administração",
                icone: "bi-shield-lock"
            },
            {
                id: "usuarios",
                texto: "Usuários",
                icone: "bi-people"
            },
            {
                id: "instituicoes",
                texto: "Instituições",
                icone: "bi-buildings"
            },
            {
                id: "agendamentos-globais",
                texto: "Agendamentos globais",
                icone: "bi-calendar-week"
            }
        ]
    };

    const menuPerfil = menus[perfil];

    if (!menuPerfil) {
        console.error("Perfil de navegação inválido:", perfil);
        return;
    }

    const itensMenu = menuPerfil.map(function (item) {
        const ativo = item.id === itemAtivo;

        if (ativo) {
            return `
                <span
                    class="item-menu ativo"
                    aria-current="page"
                >
                    <i class="bi ${item.icone}" aria-hidden="true"></i>

                    <span>${item.texto}</span>
                </span>
            `;
        }

        return `
            <span
                class="item-menu indisponivel"
                aria-disabled="true"
            >
                <i class="bi ${item.icone}" aria-hidden="true"></i>

                <span class="texto-item-menu">
                    <span>${item.texto}</span>
                    <small>Em desenvolvimento</small>
                </span>
            </span>
        `;
    }).join("");

    navegacaoApp.innerHTML = `
        <div class="marca">
            <div class="marca-icone" aria-hidden="true">
                T.
            </div>

            <span class="marca-nome">
                Tea<span>Saude</span>
            </span>
        </div>

        <nav class="menu" aria-label="Navegação principal">
            ${itensMenu}
        </nav>

        <div class="rodape-sidebar">
            <span
                class="item-menu indisponivel"
                aria-disabled="true"
            >
                <i
                    class="bi bi-box-arrow-left"
                    aria-hidden="true"
                ></i>

                <span class="texto-item-menu">
                    <span>Sair</span>
                    <small>Em desenvolvimento</small>
                </span>
            </span>
        </div>
    `;
});