import { bootstrapApplication } from '@angular/platform-browser';
import { inject, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { CanActivateFn, Router, Routes, provideRouter, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { App } from './app/app';
import { Api } from './app/api';
import { configurarApi } from './app/conexao';
import { menu } from './app/navegacao';
import { Acesso } from './app/telas/acesso';
import { Inicio } from './app/telas/inicio';
import { Pacientes } from './app/telas/pacientes';
import { Busca } from './app/telas/busca';
import { Agenda } from './app/telas/agenda';
import { Horarios } from './app/telas/horarios';
import { Profissionais } from './app/telas/profissionais';
import { Contas } from './app/telas/contas';
const proteger: CanActivateFn = async (rota) => {
  const api = inject(Api),
    router = inject(Router);
  if (!(await api.restaurar())) return router.parseUrl('/entrar');
  const item = menu.find((i) => i.rota === rota.routeConfig?.path);
  return item?.perfis.includes(api.usuario()!.perfil) || router.parseUrl('/inicio');
};
const publico: CanActivateFn = async () => {
  const api = inject(Api),
    router = inject(Router);
  return (await api.restaurar()) ? router.parseUrl('/inicio') : true;
};
const paginas = {
  inicio: Inicio,
  pacientes: Pacientes,
  buscar: Busca,
  agendamentos: Agenda,
  horarios: Horarios,
  profissionais: Profissionais,
  contas: Contas
};
const routes: Routes = [
  { path: 'entrar', component: Acesso, canActivate: [publico] },
  { path: 'criar-conta', component: Acesso, canActivate: [publico] },
  ...Object.entries(paginas).map(([path, component]) => ({
    path,
    component,
    canActivate: [proteger]
  })),
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: '**', redirectTo: 'inicio' }
];
configurarApi()
  .then(() =>
    bootstrapApplication(App, {
      providers: [
        provideZoneChangeDetection(),
        provideRouter(routes, withHashLocation()),
        provideServiceWorker('ngsw-worker.js', {
          enabled: !isDevMode(),
          registrationStrategy: 'registerImmediately'
        })
      ]
    })
  )
  .catch(() => {
    document.body.textContent =
      'Não foi possível abrir o TeaSaude. Atualize a página para tentar novamente.';
  });
