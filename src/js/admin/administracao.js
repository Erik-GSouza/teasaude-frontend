document.addEventListener("DOMContentLoaded", async function () {
    const lista = document.getElementById("listaPacientes");
    const estado = document.getElementById("estadoPacientes");
    const titulo = document.getElementById("tituloPacientes");
    const painelPaciente = document.getElementById("painelPaciente");
    const estadoPaciente = document.getElementById("estadoPaciente");
    const dadosPaciente = document.getElementById("dadosPaciente");
    const botaoEditar = document.getElementById("botaoEditarPaciente");
    const formEditar = document.getElementById("formEditarPaciente");
    const botaoCancelar = document.getElementById("botaoCancelarEdicao");
    const botaoSalvar = document.getElementById("botaoSalvarPaciente");
    const mensagemEdicao = document.getElementById("mensagemEdicao");

    let pacienteAtual = null;
    const token = obterToken();

    if (!token) {
        return; // protecao da pag cuida do redirecionamento
    }

    //data vem como textoISO. n converter com new Date(ISO) pra exibir no input
    function dataCivil(data) {
        return typeof data === "string" ? data.split("T")[0] : "";
    }

    //ve um paciente especifico pelo ID trazido pela API
    async function consultarPaciente(id) {
        pacienteAtual = null;
        painelPaciente.hidden = false;
        dadosPaciente.hidden = true;
        botaoEditar.hidden = true;
        formEditar.hidden = true;
        estadoPaciente.textContent = "Consultando paciente...";

        try {
            const resposta = await fetch(
                `${API_BASE_URL}/api/pacientes/${encodeURIComponent(id)}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store"
                }
            );

            if (resposta.status === 401) {
                limparSessao();
                window.location.replace("../../../index.html");
                return false;
            }

            if (resposta.status === 403) {
                estadoPaciente.textContent = "Sem permissão para consultar este paciente.";
                return false;
            }

            const resultado = await resposta.json().catch(() => null);
            if (!resposta.ok || !resultado?.data) {
                throw new Error("Falha na consulta do paciente.");
            }

            const paciente = resultado.data;
            pacienteAtual = paciente;

            document.getElementById("detalheNome").textContent =
                paciente.nomeCompleto || "Não informado";

            const partesData = dataCivil(paciente.dataNascimento).split("-");
            document.getElementById("detalheNascimento").textContent =
                partesData.length === 3
                    ? `${partesData[2]}/${partesData[1]}/${partesData[0]}`
                    : "Não informada";

            document.getElementById("detalheResponsavel").textContent =
                paciente.nomeContato || "Não informado";
            document.getElementById("detalheTelefone").textContent =
                paciente.telefoneContato || "Não informado";
            document.getElementById("detalheEmail").textContent =
                paciente.emailContato || "Não informado";

            estadoPaciente.textContent = "";
            dadosPaciente.hidden = false;
            botaoEditar.hidden = false;

            painelPaciente.scrollIntoView({ behavior: "smooth", block: "start" });
            return true;
        } catch (erro) {
            estadoPaciente.textContent = "Não foi possível carregar os dados do paciente.";
            return false;
        }
    }

    //eventos aqui ficam FORA de consultarPaciente, para serem registrados 1 unca vez
    botaoEditar.addEventListener("click", function () {
        if (!pacienteAtual) return;

        document.getElementById("editarNomeCompleto").value =
            pacienteAtual.nomeCompleto || "";
        document.getElementById("editarDataNascimento").value =
            dataCivil(pacienteAtual.dataNascimento);
        document.getElementById("editarNomeContato").value =
            pacienteAtual.nomeContato || "";
        document.getElementById("editarTelefoneContato").value =
            pacienteAtual.telefoneContato || "";
        document.getElementById("editarEmailContato").value =
            pacienteAtual.emailContato || "";

        mensagemEdicao.textContent = "";
        dadosPaciente.hidden = true;
        botaoEditar.hidden = true;
        formEditar.hidden = false;
    });

    botaoCancelar.addEventListener("click", function () {
        formEditar.hidden = true;
        dadosPaciente.hidden = false;
        botaoEditar.hidden = false;
        mensagemEdicao.textContent = "";
    });

    // envia so campos alterados (nunca o objeto inteiro retornado pelo banco)
    formEditar.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        if (!pacienteAtual || botaoSalvar.disabled) return;

        mensagemEdicao.textContent = "";
        if (!formEditar.checkValidity()) {
            formEditar.reportValidity();
            return;
        }

        const nomeCompleto = document.getElementById("editarNomeCompleto").value.trim();
        const dataNascimento = document.getElementById("editarDataNascimento").value;
        const nomeContato = document.getElementById("editarNomeContato").value.trim();
        const telefoneDigitado = document.getElementById("editarTelefoneContato").value.trim();
        const emailContato = document.getElementById("editarEmailContato").value.trim();

        if (nomeCompleto.length < 3 || !nomeContato) {
            mensagemEdicao.textContent = "Confira o nome do paciente e do responsável.";
            return;
        }

        const telefoneValido = /^[0-9\s().-]+$/.test(telefoneDigitado) &&
            [10, 11].includes(telefoneDigitado.replace(/\D/g, "").length);
        if (!telefoneValido) {
            mensagemEdicao.textContent = "Informe um telefone com DDD e 10 ou 11 dígitos.";
            return;
        }

        const valoresAtuais = {
            nomeCompleto,
            dataNascimento,
            nomeContato,
            telefoneContato: telefoneDigitado.replace(/\D/g, ""),
            emailContato
        };

        const valoresAnteriores = {
            nomeCompleto: pacienteAtual.nomeCompleto || "",
            dataNascimento: dataCivil(pacienteAtual.dataNascimento),
            nomeContato: pacienteAtual.nomeContato || "",
            telefoneContato: String(pacienteAtual.telefoneContato || "").replace(/\D/g, ""),
            emailContato: pacienteAtual.emailContato || ""
        };

        const alteracoes = {};
        Object.keys(valoresAtuais).forEach(function (campo) {
            if (valoresAtuais[campo] !== valoresAnteriores[campo]) {
                alteracoes[campo] = valoresAtuais[campo];
            }
        });

        if (Object.keys(alteracoes).length === 0) {
            mensagemEdicao.textContent = "Nenhuma alteração foi realizada.";
            return;
        }

        // validar somente se a data de nascimento tiver sido alterada
        if (Object.prototype.hasOwnProperty.call(alteracoes, "dataNascimento")) {
            const [ano, mes, dia] = dataNascimento.split("-").map(Number);
            const nascimento = new Date(ano, mes - 1, dia);
            const hoje = new Date();
            const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

            let idade = hoje.getFullYear() - ano;
            if (hoje.getMonth() + 1 < mes ||
                (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) {
                idade--;
            }

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento) ||
                nascimento.getFullYear() !== ano ||
                nascimento.getMonth() !== mes - 1 ||
                nascimento.getDate() !== dia ||
                nascimento > hojeSemHora ||
                idade >= 18
            ) {
                mensagemEdicao.textContent =
                    "Informe uma data válida para um paciente menor de 18 anos.";
                return;
            }
        }

        const id = pacienteAtual._id;
        if (!id) {
            mensagemEdicao.textContent = "Paciente sem identificador válido.";
            return;
        }

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";

        try {
            const resposta = await fetch(
                `${API_BASE_URL}/api/pacientes/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(alteracoes)
                }
            );

            if (resposta.status === 401) {
                limparSessao();
                window.location.replace("../../../index.html");
                return;
            }

            const resultado = await resposta.json().catch(() => null);
            if (!resposta.ok) {
                mensagemEdicao.textContent =
                    typeof resultado?.message === "string"
                        ? resultado.message
                        : "Não foi possível atualizar o paciente.";
                return;
            }

            //nova consulta:a tela exibe somente o que o banco devolveu apos salvar
            const confirmado = await consultarPaciente(id);
            if (confirmado) {
                estadoPaciente.textContent = "Alterações salvas e consulta atualizada.";
            } else {
                estadoPaciente.textContent =
                    "Atualização aceita, mas não foi possível confirmar a consulta.";
            }
        } catch (erro) {
            mensagemEdicao.textContent =
                "Erro de conexão. Confira a API e tente novamente.";
        } finally {
            botaoSalvar.disabled = false;
            botaoSalvar.textContent = "Salvar alterações";
        }
    });

    //listagem inicial dos pacientes
    try {
        const resposta = await fetch(`${API_BASE_URL}/api/pacientes`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        if (resposta.status === 401) {
            limparSessao();
            window.location.replace("../../../index.html");
            return;
        }

        if (resposta.status === 403) {
            estado.textContent = "Você não tem permissão para consultar pacientes.";
            return;
        }

        const dados = await resposta.json().catch(() => null);
        if (!resposta.ok || !Array.isArray(dados?.data)) {
            throw new Error("Resposta inválida da API.");
        }

        lista.replaceChildren();
        const pacientes = dados.data;
        titulo.textContent = `Pacientes cadastrados (${pacientes.length})`;

        if (pacientes.length === 0) {
            estado.textContent = "Nenhum paciente cadastrado.";
            return;
        }

        pacientes.forEach(function (paciente) {
            const item = document.createElement("li");
            item.className = "item-paciente";

            const nome = document.createElement("h3");
            nome.textContent = paciente.nomeCompleto || "Nome não informado";

            const contato = document.createElement("p");
            contato.textContent =
                `Responsável: ${paciente.nomeContato || "Não informado"}`;

            const botaoConsultar = document.createElement("button");
            botaoConsultar.type = "button";
            botaoConsultar.className = "botao-consultar";
            botaoConsultar.textContent = "Ver dados";
            botaoConsultar.disabled = !paciente._id;
            botaoConsultar.addEventListener("click", function () {
                consultarPaciente(paciente._id);
            });

            item.append(nome, contato, botaoConsultar);
            lista.appendChild(item);
        });

        lista.hidden = false;
        estado.hidden = true;
    } catch (erro) {
        estado.textContent =
            "Não foi possível carregar os pacientes. Verifique a conexão com a API.";
    }
});