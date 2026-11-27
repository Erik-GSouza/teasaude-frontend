import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = fileURLToPath(new URL('../dist/teasaude/browser/', import.meta.url));
const tipos = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain'
};
try {
  await fs.access(path.join(raiz, 'index.html'));
} catch {
  console.error('Execute npm run build primeiro.');
  process.exit(1);
}
const porta = Number(process.env.PORT || 4173);
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const rota = decodeURIComponent(url.pathname).replace(/^\/teasaude-frontend(?=\/|$)/, '');
      const arquivo = path.resolve(raiz, '.' + (rota === '/' || !rota ? '/index.html' : rota));
      if (!arquivo.startsWith(path.resolve(raiz) + path.sep)) {
        res.writeHead(404).end();
        return;
      }
      const conteudo = await fs.readFile(arquivo);
      res
        .writeHead(200, {
          'Content-Type': tipos[path.extname(arquivo)] || 'application/octet-stream',
          'Cache-Control': 'no-cache'
        })
        .end(conteudo);
    } catch {
      res.writeHead(404).end('Arquivo não encontrado.');
    }
  })
  .listen(porta, '127.0.0.1', () => console.log('Prévia PWA: http://localhost:' + porta + '/'));
