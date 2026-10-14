document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formCriarConta");
    const mensagem = document.getElementById("mensagemCadastro");

    const ids = [
        "nomeUsuario",
        "senha",
        "confirmarSenha",
        "nomeCompleto",
        "dataNascimento",
        "nomeContato",
        "telefoneContato",
        "emailContato"
    ];

    const campos = {};

    ids.forEach(function (id) {
        campos[id] = document.getElementById(id);
    });

    // Regras validaçao
    const validadores = {
        nomeUsuario(valor) {
            const usuario = valor.trim().toLowerCase();

            if (!/^[a-z0-9._-]{3,30}$/.test(usuario)) {
                return "Use de 3 a 30 caracteres: letras, números, ponto, hífen ou sublinhado.";
            }

            return "";
        },

        senha(valor) {
            if (valor.length < 8) {
                return "A senha deve ter pelo menos 8 caracteres.";
            }

            if (new TextEncoder().encode(valor).length > 72) {
                return "A senha deve ter no máximo 72 bytes.";
            }

            return "";
        },

        confirmarSenha(valor) {
            if (!valor) {
                return "Confirme sua senha.";
            }

            if (valor !== campos.senha.value) {
                return "As senhas não coincidem.";
            }

            return "";
        },

        nomeCompleto(valor) {
            if (valor.trim().length < 3) {
                return "Informe o nome completo do paciente com pelo menos 3 caracteres.";
            }

            return "";
        },

        dataNascimento(valor) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
                return "Informe a data de nascimento.";
            }

            const [ano, mes, dia] = valor.split("-").map(Number);

            const nascimento = new Date(ano, mes - 1, dia);

            const dataValida =
                nascimento.getFullYear() === ano &&
                nascimento.getMonth() === mes - 1 &&
                nascimento.getDate() === dia;

            if (!dataValida) {
                return "Informe uma data válida.";
            }

            const hoje = new Date();

            const hojeSemHora = new Date(
                hoje.getFullYear(),
                hoje.getMonth(),
                hoje.getDate()
            );

            if (nascimento > hojeSemHora) {
                return "A data não pode estar no futuro.";
            }

            let idade = hoje.getFullYear() - ano;

            const fezAniversario =
                hoje.getMonth() + 1 > mes ||
                (
                    hoje.getMonth() + 1 === mes &&
                    hoje.getDate() >= dia
                );

            if (!fezAniversario) {
                idade--;
            }

            if (idade >= 18) {
                return "O paciente deve ter menos de 18 anos.";
            }

            return "";
        },

        nomeContato(valor) {
            if (!valor.trim()) {
                return "Informe o nome do responsável.";
            }

            return "";
        },

        telefoneContato(valor) {
            const telefone = valor.trim();
            if (!/^[0-9\s().-]+$/.test(telefone)) {
                return "O telefone deve conter apenas números e formatação válida.";}

            const digitos = telefone.replace(/\D/g, "");

            if (digitos.length !== 10 && digitos.length !== 11) {
                return "Informe um telefone com DDD e 10 ou 11 dígitos.";}

            return "";
        },

        emailContato(valor) {
            const email = valor.trim();

            if (!email) {
                return "";}

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return "Informe um e-mail válido.";}

            return "";
        }
    };

    // Exibe ou remove o erro de um campo
    function validarCampo(id) {
        const campo = campos[id];

        const idErro =
            "erro" + id.charAt(0).toUpperCase() + id.slice(1);

        const elementoErro = document.getElementById(idErro);
        const erro = validadores[id](campo.value);

        elementoErro.textContent = erro;

        campo.classList.toggle("campo-invalido", Boolean(erro));
        if (erro) {
            campo.setAttribute("aria-invalid", "true");
        } else {
            campo.removeAttribute("aria-invalid");
        }

        return erro === "";
    }

    // validaçao ao sair dos campos e ao corrigir erros
    ids.forEach(function (id) {
        const campo = campos[id];

        campo.addEventListener("blur", function () {
            validarCampo(id);
        });

        campo.addEventListener("input", function () {
            const idErro =
                "erro" + id.charAt(0).toUpperCase() + id.slice(1);

            if (document.getElementById(idErro).textContent) {
                validarCampo(id);
            }

            mensagem.textContent = "";
        });
    });

    // Se senha mudar, conferir de novo a confirmaçao
    campos.senha.addEventListener("input", function () {
        if (campos.confirmarSenha.value) {
            validarCampo("confirmarSenha");
        }
    });

    // cadastro API
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const botao = document.getElementById("botaoCadastrar");

        // impede envios repetidos
        if (botao.disabled) {
            return;
        }

        mensagem.textContent = "";
        mensagem.classList.remove("mensagem-erro");

        // valida todos os campos
        let primeiroInvalido = null;

        ids.forEach(function (id) {
            if (!validarCampo(id) && !primeiroInvalido) {
                primeiroInvalido = campos[id];
            }
        });

        if (primeiroInvalido) {
            primeiroInvalido.focus();
            return;
        }

        // dados enviados pro backe
        const dadosCadastro = {
            nomeUsuario: campos.nomeUsuario.value.trim().toLowerCase(),
            senha: campos.senha.value,
            nomeCompleto: campos.nomeCompleto.value.trim(),
            dataNascimento: campos.dataNascimento.value,
            nomeContato: campos.nomeContato.value.trim(),
            telefoneContato: campos.telefoneContato.value.trim(),
            emailContato: campos.emailContato.value.trim()
        };

        botao.disabled = true;
        botao.textContent = "Cadastrando...";

        let cadastroConcluido = false;

        try {
            const resposta = await fetch(
                `${API_BASE_URL}/api/auth/cadastro`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dadosCadastro)
                }
            );

            const dados = await resposta.json().catch(() => null);

            // cvadastro confirmado pela API
            if (resposta.status === 201) {
                cadastroConcluido = true;

                mensagem.textContent =
                    "Conta e paciente cadastrados com sucesso! " +
                    "Agora você pode entrar pelo login.";

                return;
            }

            mensagem.classList.add("mensagem-erro");

            // nome de user repetido
            if (resposta.status === 409) {
                mensagem.textContent =
                    "Esse nome de usuário já está cadastrado.";

                const erroUsuario =
                    document.getElementById("erroNomeUsuario");

                erroUsuario.textContent =
                    "Escolha outro nome de usuário.";

                campos.nomeUsuario.classList.add("campo-invalido");
                campos.nomeUsuario.setAttribute(
                    "aria-invalid",
                    "true"
                );

                campos.nomeUsuario.focus();
                return;
            }

            // outros erros que voltam pelo back
            mensagem.textContent =
                typeof dados?.message === "string"
                    ? dados.message
                    : "Não foi possível realizar o cadastro.";

        } catch (erro) {
            mensagem.classList.add("mensagem-erro");

            mensagem.textContent =
                "Não foi possível conectar à API. " +
                "Confira se o servidor está funcionando.";

        } finally {
            if (cadastroConcluido) {
                botao.textContent = "Conta criada";
            } else {
                botao.disabled = false;
                botao.textContent = "Criar conta";
            }
        }
    });
});