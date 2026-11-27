import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ErroApi, requisicao } from './conexao';
import { Usuario } from './modelos';
const chave = 'teasaude.sessao.angular';
@Injectable({ providedIn: 'root' })
export class Api {
  private router = inject(Router);
  usuario = signal<Usuario | null>(null);
  aviso = signal('');
  private token = '';
  private restaurando?: Promise<boolean>;
  constructor() {
    try {
      this.token = sessionStorage.getItem(chave) || '';
    } catch {}
  }
  private guardar(t: string) {
    this.token = t;
    try {
      if (t) sessionStorage.setItem(chave, t);
      else sessionStorage.removeItem(chave);
    } catch {}
  }
  async chamar<T>(rota: string, metodo = 'GET', dados?: unknown): Promise<T> {
    const token = this.token;
    try {
      const r = await requisicao<T>(rota, metodo, dados, token);
      if (token !== this.token) throw new Error('A sessão mudou.');
      return r;
    } catch (e) {
      if (token && token === this.token && e instanceof ErroApi && e.status === 401) {
        this.sair('Sua sessão terminou. Entre novamente.');
      }
      throw e;
    }
  }
  async entrar(nomeUsuario: string, senha: string) {
    const r = await requisicao<{ token: string }>('/auth/login', 'POST', {
      nomeUsuario: nomeUsuario.trim().toLowerCase(),
      senha
    });
    this.guardar(r.token);
    try {
      const { usuario } = await this.chamar<{ usuario: Usuario }>('/auth/me');
      this.usuario.set(usuario);
    } catch (e) {
      this.guardar('');
      this.usuario.set(null);
      throw e;
    }
  }
  async restaurar() {
    if (this.usuario()) return true;
    if (!this.token) return false;
    this.restaurando ??= this.chamar<{ usuario: Usuario }>('/auth/me')
      .then((r) => {
        this.usuario.set(r.usuario);
        return true;
      })
      .catch((e) => {
        if (this.token)
          this.aviso.set(e instanceof Error ? e.message : 'Não foi possível verificar a sessão.');
        return false;
      })
      .finally(() => {
        this.restaurando = undefined;
      });
    return this.restaurando;
  }
  sair(aviso = '') {
    this.guardar('');
    this.usuario.set(null);
    this.aviso.set(aviso);
    void this.router.navigateByUrl('/entrar');
  }
}
