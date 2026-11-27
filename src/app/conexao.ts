export const apiPadrao = 'https://teasaude-backend.onrender.com/api';
let base = apiPadrao;
export async function configurarApi() {
  try {
    const r = await fetch(new URL('config.json', document.baseURI), { cache: 'no-store' });
    if (r.ok) {
      const c = await r.json();
      if (typeof c.apiUrl === 'string' && /^https?:\/\//.test(c.apiUrl))
        base = c.apiUrl.replace(/\/+$/, '');
    }
  } catch {}
}
export class ErroApi extends Error {
  constructor(
    public status: number,
    texto: string
  ) {
    super(texto);
  }
}
export async function requisicao<T>(
  rota: string,
  metodo = 'GET',
  dados?: unknown,
  token = '',
  raiz = base
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (dados !== undefined) headers['Content-Type'] = 'application/json';
  let r: Response;
  try {
    r = await fetch(raiz + rota, {
      method: metodo,
      headers,
      body: dados === undefined ? undefined : JSON.stringify(dados),
      cache: 'no-store',
      credentials: 'omit',
      signal: AbortSignal.timeout(70000)
    });
  } catch {
    throw new ErroApi(
      0,
      'Não foi possível contatar o servidor. Confira sua conexão antes de tentar novamente.'
    );
  }
  if (r.status === 204) return undefined as T;
  const texto = await r.text();
  let json;
  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    throw new ErroApi(r.status, 'O servidor respondeu em um formato inesperado.');
  }
  if (!r.ok) throw new ErroApi(r.status, json?.message || 'Não foi possível concluir esta ação.');
  return json as T;
}
