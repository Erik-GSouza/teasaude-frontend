document.addEventListener("DOMContentLoaded", function () {
    console.log("Frontend funcionando");

    const inputNomeCompleto = document.querySelector("#nomeCompleto");
    const erroNomeCompleto = document.querySelector("#erroNomeCompleto");

    const inputDataNascimento = document.querySelector("#dataNascimento");
    const erroDataNascimento = document.querySelector("#erroDataNascimento");

    const inputNomeContato = document.querySelector("#nomeContato");
    const erroNomeContato = document.querySelector("#erroNomeContato");

    const inputTelefoneContato = document.querySelector("#telefoneContato");
    const erroTelefoneContato = document.querySelector("#erroTelefoneContato");

    const inputEmailContato = document.querySelector("#emailContato");
    const erroEmailContato = document.querySelector("#erroEmailContato");

    const formPaciente = document.querySelector("#formPaciente");
    const mensagemFormulario = document.querySelector("#mensagemFormulario");  

    function validarNomeCompleto() {
        const nome = inputNomeCompleto.value.trim();

        if (nome === "") {
            erroNomeCompleto.textContent =
                "Informe o nome completo do paciente.";

            inputNomeCompleto.classList.add("campo-invalido");
            inputNomeCompleto.setAttribute("aria-invalid", "true");

            return false;
        }

        erroNomeCompleto.textContent = "";

        inputNomeCompleto.classList.remove("campo-invalido");
        inputNomeCompleto.removeAttribute("aria-invalid");

        return true;
    }

    function calcularIdade(dataNascimento) {
        const hoje = new Date();

        let idade =
            hoje.getFullYear() - dataNascimento.getFullYear();

        const mesAtual = hoje.getMonth();
        const mesNascimento = dataNascimento.getMonth();

        const aindaNaoFezAniversario =
            mesAtual < mesNascimento ||
            (
                mesAtual === mesNascimento &&
                hoje.getDate() < dataNascimento.getDate()
            );

        if (aindaNaoFezAniversario) {
            idade--;
        }

        return idade;
    }

    function validarDataNascimento() {
        const valor = inputDataNascimento.value;

        if (valor === "") {
            erroDataNascimento.textContent =
                "Informe a data de nascimento.";

            inputDataNascimento.classList.add("campo-invalido");
            inputDataNascimento.setAttribute("aria-invalid", "true");

            return false;
        }

        const partes = valor.split("-");

        const ano = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);

        const dataNascimento = new Date(ano, mes - 1, dia);

        const dataValida =
            dataNascimento.getFullYear() === ano &&
            dataNascimento.getMonth() === mes - 1 &&
            dataNascimento.getDate() === dia;

        if (!dataValida) {
            erroDataNascimento.textContent =
                "Informe uma data de nascimento válida.";

            inputDataNascimento.classList.add("campo-invalido");
            inputDataNascimento.setAttribute("aria-invalid", "true");

            return false;
        }

        const hoje = new Date();

        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth() + 1;
        const diaAtual = hoje.getDate();

        const dataFutura =
            ano > anoAtual ||
            (
                ano === anoAtual &&
                mes > mesAtual
            ) ||
            (
                ano === anoAtual &&
                mes === mesAtual &&
                dia > diaAtual
            );

        if (dataFutura) {
            erroDataNascimento.textContent =
                "A data de nascimento não pode estar no futuro.";

            inputDataNascimento.classList.add("campo-invalido");
            inputDataNascimento.setAttribute("aria-invalid", "true");

            return false;
        }

        const idade = calcularIdade(dataNascimento);

        if (idade >= 18) {
            erroDataNascimento.textContent =
                "O paciente deve ter menos de 18 anos no cadastro.";

            inputDataNascimento.classList.add("campo-invalido");
            inputDataNascimento.setAttribute("aria-invalid", "true");

            return false;
        }

        erroDataNascimento.textContent = "";

        inputDataNascimento.classList.remove("campo-invalido");
        inputDataNascimento.removeAttribute("aria-invalid");

        return true;
    }

    function validarNomeContato() {
        const nome = inputNomeContato.value.trim();

        if (nome === "") {
            erroNomeContato.textContent =
                "Informe o nome do adulto responsável.";

            inputNomeContato.classList.add("campo-invalido");
            inputNomeContato.setAttribute("aria-invalid", "true");

            return false;
        }

        erroNomeContato.textContent = "";

        inputNomeContato.classList.remove("campo-invalido");
        inputNomeContato.removeAttribute("aria-invalid");

        return true;
    }

    function validarTelefoneContato() {
        const valor = inputTelefoneContato.value.trim();

        if (valor === "") {
            erroTelefoneContato.textContent =
                "Informe o telefone de contato.";

            inputTelefoneContato.classList.add("campo-invalido");
            inputTelefoneContato.setAttribute("aria-invalid", "true");

            return false;
        }

        const somenteDigitos = valor.replace(/\D/g, "");

        if (
            somenteDigitos.length !== 10 &&
            somenteDigitos.length !== 11
        ) {
            erroTelefoneContato.textContent =
                "Informe um telefone com DDD e 10 ou 11 dígitos.";

            inputTelefoneContato.classList.add("campo-invalido");
            inputTelefoneContato.setAttribute("aria-invalid", "true");

            return false;
        }

        erroTelefoneContato.textContent = "";

        inputTelefoneContato.classList.remove("campo-invalido");
        inputTelefoneContato.removeAttribute("aria-invalid");

        return true;
    }

    function validarEmailContato() {
        const email = inputEmailContato.value.trim();

        if (email === "") {
            erroEmailContato.textContent = "";

            inputEmailContato.classList.remove("campo-invalido");
            inputEmailContato.removeAttribute("aria-invalid");

            return true;
        }

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(email)) {
            erroEmailContato.textContent = "Informe um e-mail válido.";

            inputEmailContato.classList.add("campo-invalido");
            inputEmailContato.setAttribute("aria-invalid", "true");

            return false;
        }

        erroEmailContato.textContent = "";

        inputEmailContato.classList.remove("campo-invalido");
        inputEmailContato.removeAttribute("aria-invalid");

        return true;
    }

    function validarFormulario() {
        const nomeValido = validarNomeCompleto();
        const dataValida = validarDataNascimento();
        const contatoValido = validarNomeContato();
        const telefoneValido = validarTelefoneContato();
        const emailValido = validarEmailContato();

        return (
            nomeValido &&
            dataValida &&
            contatoValido &&
            telefoneValido &&
            emailValido
        );
    }

    inputNomeCompleto.addEventListener("blur",validarNomeCompleto);

    inputNomeCompleto.addEventListener("input", function () {
        if (erroNomeCompleto.textContent !== "") { validarNomeCompleto();}
    });

    inputDataNascimento.addEventListener("blur",validarDataNascimento);

    inputDataNascimento.addEventListener("input", function () {
        if (erroDataNascimento.textContent !== "") {validarDataNascimento();}
    });

    inputNomeContato.addEventListener(
        "blur", validarNomeContato
    );

    inputNomeContato.addEventListener("input", function () {
        if (erroNomeContato.textContent !== "") {validarNomeContato();}
    });

    inputTelefoneContato.addEventListener(
        "blur", validarTelefoneContato
    );

    inputTelefoneContato.addEventListener("input", function () {
        if (erroTelefoneContato.textContent !== "") {validarTelefoneContato();}
    });

    inputEmailContato.addEventListener(
        "blur", validarEmailContato
    );

    inputEmailContato.addEventListener("input", function () {
        if (erroEmailContato.textContent !== "") {validarEmailContato();}
    });

    formPaciente.addEventListener("submit", function (event) {
        event.preventDefault();

        mensagemFormulario.textContent = "";

        const formularioValido = validarFormulario();

        if (!formularioValido) {const primeiroCampoInvalido =
                formPaciente.querySelector(".campo-invalido");

            if (primeiroCampoInvalido) {
                primeiroCampoInvalido.focus();
            }

            return;
        }

        mensagemFormulario.textContent =
            "Os dados passaram pela validação local. " +
            "O cadastro ainda não foi enviado, pois a API não está integrada.";
    });
});