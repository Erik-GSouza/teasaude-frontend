document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formLogin");
    const inputUsuario = document.getElementById("nomeUsuario");
    const inputSenha = document.getElementById("senha");
    const botaoEntrar = document.getElementById("botaoEntrar");
    const mensagem = document.getElementById("mensagemLogin");

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const nomeUsuario = inputUsuario.value.trim();
        const senha = inputSenha.value;

        mensagem.textContent = "";
        mensagem.classList.remove("login-erro", "login-sucesso");

        if (!nomeUsuario) {
            mensagem.textContent = "Informe o nome de usuário.";
            mensagem.classList.add("login-erro");
            inputUsuario.focus();
            return;
        }

        if (!senha) {
            mensagem.textContent = "Informe a senha.";
            mensagem.classList.add("login-erro");
            inputSenha.focus();
            return;
        }

        botaoEntrar.disabled = true;
        botaoEntrar.textContent = "Entrando...";

        try {
            const resposta = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nomeUsuario,
                        senha
                    })
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                mensagem.textContent =
                    typeof dados?.message === "string"
                        ? dados.message
                        : "Não foi possível realizar o login.";

                mensagem.classList.add("login-erro");
                return;
            }

            if (typeof dados?.token !== "string" || !dados.token) {
                throw new Error("Resposta de login incompleta.");
            }

            const usuario = await consultarSessao(dados.token);

            if (!usuario) {
                sessionStorage.removeItem("teasaude_token");

                mensagem.textContent =
                    "Login aceito, mas não foi possível confirmar a sessão.";

                mensagem.classList.add("login-erro");
                return;
            }

            sessionStorage.setItem("teasaude_token", dados.token);

            // pag correspondente a cada perfil
            const destinos = {
                paciente: "./src/pages/paciente/inicio.html",
                gestor: "./src/pages/gestor/solicitacoes.html",
                admin: "./src/pages/admin/administracao.html"
            };

            const destino = destinos[usuario.perfil];

            if (!destino) {
                sessionStorage.removeItem("teasaude_token");

                mensagem.textContent = "Perfil de usuário não reconhecido.";
                mensagem.classList.add("login-erro");
                return;
            }

            // Redireciona so dpois d confirmar a sessao ai navega ate a pag
            window.location.assign(destino);

        } catch (erro) {
            mensagem.textContent =
                "Não foi possível concluir o login. Verifique a conexão com a API.";

            mensagem.classList.add("login-erro");

        sessionStorage.removeItem("teasaude_token");

        } finally {
            botaoEntrar.disabled = false;
            botaoEntrar.textContent = "Entrar";
        }
    });

});