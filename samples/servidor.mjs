#!/usr/bin/env node
// Servidor HTTP simples em JavaScript moderno
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const PORTA = Number(process.env.PORTA) || 3000;
const rotas = new Map();
const padraoId = /^\/livros\/(\d+)$/i;

class ErroHttp extends Error {
  #status;
  constructor(status, mensagem) {
    super(mensagem);
    this.#status = status;
  }
  get status() { return this.#status; }
  static naoEncontrado() { return new ErroHttp(404, 'Nao encontrado'); }
}

rotas.set('/', async () => ({ ok: true, hora: new Date().toISOString() }));
rotas.set('/config', async () => JSON.parse(await readFile('./config.json', 'utf8')));

const servidor = createServer(async (req, res) => {
  try {
    const casamento = req.url.match(padraoId);
    const tratar = casamento ? async () => ({ id: parseInt(casamento[1], 10) }) : rotas.get(req.url);
    if (typeof tratar !== 'function') throw ErroHttp.naoEncontrado();
    const corpo = await tratar(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(corpo));
  } catch (erro) {
    res.writeHead(erro instanceof ErroHttp ? erro.status : 500);
    res.end(erro?.message ?? 'erro');
  } finally {
    console.log(`${req.method} ${req.url}`);
  }
});

servidor.listen(PORTA, () => console.info('Ouvindo na porta %d', PORTA));
export { servidor, ErroHttp };
