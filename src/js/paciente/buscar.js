document.addEventListener("DOMContentLoaded", async function () {

    const lista = document.getElementById("listaAtendimentos");
    const estado = document.getElementById("estadoBusca");
    const descricao = document.getElementById("descricaoResultados");

    function mostrarEstado(texto, erro = false) {
        estado.textContent = texto;
        estado.hidden = false;
        estado.classList.toggle("erro-busca", erro);
        lista.hidden = true;
    }

    function criarCartao(medico) {

        const artigo = document.createElement("article");
        artigo.className = "item-atendimento";

        const informacoes = document.createElement("div");
        informacoes.className = "informacoes-atendimento";

        const titulo = document.createElement("h3");
        titulo.textContent =
            medico.nomeCompleto || "Profissional sem nome informado";

        const detalhes = document.createElement("p");

        const especialidade =
            medico.especialidade || "Especialidade não informada";

        const instituicao =
            medico.instituicaoId?.nomePublico ||
            "Instituição não informada";

        detalhes.textContent =
            `${especialidade} · ${instituicao}`;

        informacoes.append(titulo, detalhes);
        artigo.appendChild(informacoes);

        return artigo;
    }

    const token = obterToken();

    if (!token) {
        mostrarEstado("Sessão não encontrada.", true);
        return;
    }

    try {
        const resposta = await fetch(
            `${API_BASE_URL}/api/medicos`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                cache: "no-store"
            }
        );

        if (resposta.status === 401) {
            limparSessao();
            window.location.replace("../../../index.html");
            return;
        }

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            throw new Error(
                dados?.message || "Falha ao consultar profissionais."
            );
        }

        if (!Array.isArray(dados?.medicos)) {
            throw new Error("Resposta inesperada da API.");
        }

        lista.replaceChildren();

        const medicos = dados.medicos;

        descricao.textContent =
            `${medicos.length} profissional(is) encontrado(s).`;

        if (medicos.length === 0) {
            mostrarEstado(
                "Nenhum profissional cadastrado foi retornado."
            );
            return;
        }

        medicos.forEach(function (medico) {
            lista.appendChild(criarCartao(medico));
        });

        estado.hidden = true;
        lista.hidden = false;

    } catch (erro) {
        descricao.textContent =
            "Não foi possível carregar os profissionais.";

        mostrarEstado(
            "Erro ao consultar a API. Verifique a conexão e tente novamente.",
            true
        );
    }

});