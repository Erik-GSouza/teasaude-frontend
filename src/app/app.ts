import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Api } from './api';
import { menu, nomeMenu } from './navegacao';
import { perfis } from './modelos';
import { Icone, Marca } from './ui';
@Component({
  selector: 'tea-app',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icone, Marca],
  templateUrl: './app.html'
})
export class App {
  api = inject(Api);
  router = inject(Router);
  perfis = perfis;
  nomeMenu = nomeMenu;
  conectado = navigator.onLine;
  aberto = false;
  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.aberto = false;
        const rota = e.urlAfterRedirects.split('?')[0].slice(1);
        document.title =
          (menu.find((i) => i.rota === rota)?.nome ||
            (rota === 'criar-conta' ? 'Criar conta' : 'Entrar')) + ' | TeaSaude';
        setTimeout(() => document.getElementById('principal')?.focus(), 0);
      }
    });
  }
  get itens() {
    const p = this.api.usuario()?.perfil;
    return p ? menu.filter((i) => i.perfis.includes(p)) : [];
  }
  get nome() {
    const u = this.api.usuario();
    return u?.nomeCompleto || u?.nomeUsuario || '';
  }
  @HostListener('window:online') aoConectar() {
    this.conectado = true;
  }
  @HostListener('window:offline') aoDesconectar() {
    this.conectado = false;
  }
  @HostListener('document:keydown.escape') fechar() {
    this.aberto = false;
  }
}
