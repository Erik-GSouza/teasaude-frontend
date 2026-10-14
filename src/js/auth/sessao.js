const CHAVE_TOKEN = "teasaude_token";

function obterToken() {
    return sessionStorage.getItem(CHAVE_TOKEN);
}

function limparSessao() {
    sessionStorage.removeItem(CHAVE_TOKEN);
}

async function consultarSessao(token) { // quem ta autenticando
    const resposta = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        },
        cache: "no-store"
    });

    if (resposta.status === 401) {
        return null;}

    if (!resposta.ok) {
        throw new Error("Falha ao consultar a sessão.");}

    const dados = await resposta.json().catch(() => null);
    const perfisValidos = ["paciente", "gestor", "admin"];

    if (!perfisValidos.includes(dados?.usuario?.perfil)) {
        return null;
    }

    return dados.usuario;
}

function encerrarSessao() {
    limparSessao();
    window.location.replace("../../../index.html");
}