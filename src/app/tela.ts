import { inject } from '@angular/core';
import { Api } from './api';
export class Tela {
  api = inject(Api);
  carregando = false;
  erro = '';
  mensagem = '';
  get perfil() {
    return this.api.usuario()?.perfil ?? 'responsavel';
  }
  focar(id: string) {
    setTimeout(() => document.getElementById(id)?.focus());
  }
  campoInvalido(nome: string, mensagem: string): never {
    setTimeout(() => {
      const campo = document.querySelector<HTMLInputElement>('main input[name="' + nome + '"]');
      if (!campo) return;
      campo.setAttribute('aria-invalid', 'true');
      campo.setCustomValidity(mensagem);
      campo.focus();
      campo.reportValidity();
      campo.setCustomValidity('');
      campo.addEventListener('input', () => campo.removeAttribute('aria-invalid'), { once: true });
    });
    throw new Error(mensagem);
  }
  async fazer(acao: () => Promise<void>) {
    if (this.carregando) return;
    this.carregando = true;
    this.erro = '';
    this.mensagem = '';
    try {
      await acao();
    } catch (e) {
      this.erro = e instanceof Error ? e.message : 'Não foi possível concluir.';
    } finally {
      this.carregando = false;
    }
  }
}
