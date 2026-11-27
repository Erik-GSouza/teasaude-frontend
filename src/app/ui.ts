import { Component, Input } from '@angular/core';
const paths: Record<string, string> = {
  inicio: 'M3 10 12 3l9 7v10h-6v-7H9v7H3z',
  busca: 'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  agenda: 'M4 6h16v15H4z M8 3v6 M16 3v6 M4 11h16 M8 15h3',
  pessoas:
    'M16 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2 M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M16 4a4 4 0 0 1 0 7 M17 15a4 4 0 0 1 4 4v2',
  hora: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2',
  profissional:
    'M5 3v5a5 5 0 0 0 10 0V3 M4 3h3 M13 3h3 M10 13v3a5 5 0 0 0 10 0v-3 M22 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  chave: 'M15 3a6 6 0 0 0-5 9L3 19v2h4l2-2v-2h2l2-2a6 6 0 1 0 2-12z M17 7h.1',
  seta: 'M4 12h15 M13 6l6 6-6 6',
  sair: 'M10 4H4v16h6 M9 12h12 M16 7l5 5-5 5',
  folha: 'M4 19C1 5 13 2 21 3c0 9-4 18-14 15 M4 21l12-13',
  mais: 'M12 4v16 M4 12h16',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  escudo: 'M12 2l8 3v6c0 6-4 9-8 11-4-2-8-5-8-11V5z M8 12l3 3 5-6',
  olho: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  usuario: 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2',
  cadeado: 'M5 10h14v11H5z M8 10V7a4 4 0 1 1 8 0v3'
};
@Component({
  selector: 'tea-icon',
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[nome]"/></svg>'
})
export class Icone {
  @Input() nome = '';
  paths = paths;
}
@Component({
  selector: 'tea-marca',
  template:
    '<span class="marca"><span class="selo" aria-hidden="true">T.</span><span>Tea<b>Saude</b></span></span>'
})
export class Marca {}
@Component({
  selector: 'tea-aviso',
  template:
    '@if (erro) { <p class="alerta erro" role="alert">{{erro}}</p> } @if (mensagem) { <p class="alerta ok" role="status">{{mensagem}}</p> } @if (carregando) { <p class="espera" role="status"><span></span> Aguarde…</p> }'
})
export class Aviso {
  @Input() erro = '';
  @Input() mensagem = '';
  @Input() carregando = false;
}
