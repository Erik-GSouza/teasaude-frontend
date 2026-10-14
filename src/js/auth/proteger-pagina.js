document.addEventListener("DOMContentLoaded", async function () {

    const token = sessionStorage.getItem("teasaude_token");

    const aplicacao = document.querySelector(".aplicacao");
    const aviso = document.getElementById("avisoSessao");

    const perfilEsperado = document.getElementById("navegacaoApp")?.dataset.perfil;

    // no token = volta login
    if (!token) {
        window.location.replace("../../../index.html");
        return;
    }

    try {
        const usuario = await consultarSessao(token);

        // Token invalido ou sessao n reconhecida
        if (!usuario) {
            sessionStorage.removeItem("teasaude_token");
            window.location.replace("../../../index.html");
            return;
        }

        // User tentando acessar a interface de outro perfil
        if (usuario.perfil !== perfilEsperado) {

            const destinos = {
                paciente: "../paciente/inicio.html",
                gestor: "../gestor/solicitacoes.html",
                admin: "../admin/administracao.html"
            };

            window.location.replace(
                destinos[usuario.perfil] || "../../../index.html"
            );

            return;
        }

        // aessao válida = libera interface
        aviso.remove();
        aplicacao.style.visibility = "";

    } catch (erro) {
        aviso.textContent =
            "Não foi possível verificar sua sessão. Confira a conexão com a API e atualize a página.";
    }

});