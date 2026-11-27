import { JSDOM, VirtualConsole } from 'jsdom';
import { SourceTextModule } from 'node:vm';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const raiz = new URL('../dist/teasaude/browser/', import.meta.url);
export async function esperar(regra, descricao = 'mudança de tela') {
  const limite = Date.now() + 4500;
  while (Date.now() < limite) {
    const valor = regra();
    if (valor) return valor;
    await new Promise((r) => setTimeout(r, 12));
  }
  throw new Error('Tempo esgotado: ' + descricao);
}
export async function aplicativo(servidor, token = '', rota = '/entrar') {
  const problemas = [];
  const vc = new VirtualConsole();
  vc.on('error', (...itens) => problemas.push(itens.map(String).join(' ')));
  vc.on('jsdomError', (e) => problemas.push(String(e)));
  const html = readFileSync(new URL('index.html', raiz), 'utf8');
  const dom = new JSDOM(html, {
    url: 'https://portal.exemplo.test/#' + rota,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole: vc
  });
  const w = dom.window,
    d = w.document;
  Object.assign(w, {
    TextEncoder,
    TextDecoder,
    Request,
    Response,
    Headers,
    AbortController,
    AbortSignal
  });
  w.fetch = async (url, options = {}) => {
    const u = new URL(String(url), d.baseURI);
    if (u.pathname.endsWith('/config.json'))
      return Response.json({ apiUrl: 'https://api.exemplo.test/api' });
    assert.equal(u.origin, 'https://api.exemplo.test');
    return servidor(u, options);
  };
  if (token) w.sessionStorage.setItem('teasaude.sessao.angular', token);
  for (const s of d.querySelectorAll('script[src]')) {
    const mod = new SourceTextModule(readFileSync(new URL(s.getAttribute('src'), raiz), 'utf8'), {
      context: dom.getInternalVMContext()
    });
    await mod.link(() => {
      throw Error('Importação inesperada no bundle.');
    });
    await mod.evaluate();
  }
  const encontra = (sel, txt) =>
    Array.from(d.querySelectorAll(sel)).find((e) => e.textContent.trim() === txt);
  function campo(sel, valor) {
    const el = d.querySelector(sel);
    assert.ok(el, 'Campo ausente: ' + sel);
    el.value = valor;
    el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  }
  async function clique(sel, txt) {
    const el = await esperar(
      () => encontra(sel, txt) && !encontra(sel, txt).disabled && encontra(sel, txt),
      txt + '; ' + problemas.join(' ')
    );
    el.click();
  }
  async function tela(sel, txt) {
    return esperar(() => encontra(sel, txt), txt + '; ' + problemas.join(' '));
  }
  async function login(perfil) {
    await tela('h2', 'Entrar no TeaSaude');
    campo('[name=usuario]', perfil);
    campo('[name=senha]', 'senha-ficticia');
    await clique('button', 'Entrar');
    await tela('h1', 'Olá, ' + perfil + '.');
  }
  async function ir(path) {
    const el = await esperar(() => d.querySelector('aside nav a[href$="/' + path + '"]'), path);
    el.click();
    await esperar(() => w.location.hash === '#/' + path, path);
  }
  return { w, d, problemas, campo, clique, tela, login, ir, fechar: () => dom.window.close() };
}
export function resposta(dados, status = 200) {
  return dados === undefined ? new Response(null, { status }) : Response.json(dados, { status });
}
