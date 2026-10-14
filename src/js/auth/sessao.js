async function consultarSessao(token) {
    const resposta = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const dados = await resposta.json().catch(() => null);

    const perfisValidos = ["paciente", "gestor", "admin"];

    if (
        !resposta.ok ||
        !perfisValidos.includes(dados?.usuario?.perfil)
    ) {
        return null;
    }

    return dados.usuario;
}