document.addEventListener("DOMContentLoaded", function () {
    const navegacaoApp = document.querySelector("#navegacaoApp");

    if (!navegacaoApp) {
        return;
    }

    const perfil = navegacaoApp.dataset.perfil;
    const itemAtivo = navegacaoApp.dataset.itemAtivo;

    const menus = {
        paciente: [
            {
                id: "inicio",
                texto: "Início",
                icone: "bi-house",
                href: "./inicio.html"
            },
            {
                id: "buscar",
                texto: "Buscar atendimento",
                icone: "bi-search",
                href: "./buscar.html"
            },
            {
                id: "agendamentos",
                texto: "Meus agendamentos",
                icone: "bi-calendar3"
            },
            {
                id: "cadastro",
                texto: "Meu cadastro",
                icone: "bi-person",
                href: "./cadastro.html"
            }
        ],
        gestor: [
            {
                id: "solicitacoes",
                texto: "Solicitações e agenda",
                icone: "bi-calendar-check",
                href: "./solicitacoes.html"
            },
            {
                id: "disponibilidades",
                texto: "Disponibilidades",
                icone: "bi-clock",
                href: "./disponibilidades.html"
            },
            {
                id: "cadastros",
                texto: "Cadastros da instituição",
                icone: "bi-building",
                href: "./cadastros.html"
            }
        ],
        admin: [
            {
                id: "administracao",
                texto: "Administração",
                icone: "bi-shield-lock",
                href: "./administracao.html"
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

        if (item.href) {
            const classeAtiva = ativo ? " ativo" : "";
            const paginaAtual = ativo ? ' aria-current="page"' : "";

            return `
                <a
                    class="item-menu${classeAtiva}"
                    href="${item.href}"${paginaAtual}
                >
                    <i class="bi ${item.icone}" aria-hidden="true"></i>
                    <span>${item.texto}</span>
                </a>
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
            <button type="button" class="botao-sair">
                <i class="bi bi-box-arrow-left" aria-hidden="true"></i>
                <span>Sair</span>
            </button>
        </div>
    `;

    const cabecalhoMobile = document.createElement("header");
    cabecalhoMobile.className = "cabecalho-mobile";

    //reaproveita a marca da sidebar no topbar mobile
    const marcaMobile = navegacaoApp.querySelector(".marca").cloneNode(true);

    const botaoSairMobile = document.createElement("button");
    botaoSairMobile.type = "button";
    botaoSairMobile.className = "botao-sair botao-sair-mobile";
    botaoSairMobile.innerHTML = `
        <i class="bi bi-box-arrow-left" aria-hidden="true"></i>
        <span>Sair</span>
    `;

    cabecalhoMobile.append(marcaMobile, botaoSairMobile);
    navegacaoApp.before(cabecalhoMobile);

    //2 botoes de sair mantem o comportamento
    document.querySelectorAll(".botao-sair").forEach(function (botao) {
        botao.addEventListener("click", encerrarSessao);
    });
});
