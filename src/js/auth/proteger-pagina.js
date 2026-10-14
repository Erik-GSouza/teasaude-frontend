document.addEventListener("DOMContentLoaded", async function () {

    const token = obterToken();
    const aplicacao = document.querySelector(".aplicacao");
    const aviso = document.getElementById("avisoSessao");
    const navegacao = document.getElementById("navegacaoApp");
    const perfilEsperado = navegacao?.dataset.perfil;

    if (!aplicacao || !aviso || !perfilEsperado) {
        console.error("Estrutura de proteção da página incompleta.");
        return;
    }

    if (!token) {
        window.location.replace("../../../index.html");
        return;
    }

    try {
        const usuario = await consultarSessao(token);

        if (!usuario) {
            limparSessao();
            window.location.replace("../../../index.html");
            return;
        }

        if (usuario.perfil !== perfilEsperado) {
            const destinos = {
                paciente: "../paciente/inicio.html",
                gestor: "../gestor/solicitacoes.html",
                admin: "../admin/administracao.html"
            };

            window.location.replace(destinos[usuario.perfil]);
            return;
        }

        aviso.remove();
        aplicacao.style.visibility = "";

    } catch (erro) {
        aviso.textContent =
            "Não foi possível verificar sua sessão. Confira a conexão com a API e atualize a página.";
    }

});