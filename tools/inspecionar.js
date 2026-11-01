// Tokeniza arquivos com as gramaticas TextMate reais e aplica o tema,
// como o "Inspect Editor Tokens and Scopes" do VS Code.
//
// Uso: node inspecionar.js <tema.json> <escopo|linguagem> <arquivo> [all]
//      node inspecionar.js <tema.json> --listar
//      node inspecionar.js <tema.json> --semantico <linguagem> <tipo[.mod...]> ...
//
// As gramaticas vem das extensoes embutidas do VS Code (resources/app/extensions)
// e das instaladas em %USERPROFILE%\.vscode\extensions. As do usuario prevalecem,
// como no editor (por exemplo, a gramatica do Pylance substitui a MagicPython).
// Variaveis opcionais: VSCODE_HOME (pasta de instalacao do VS Code),
// VSCODE_EXTENSIONS (pasta de extensoes do usuario) e GRAMATICAS (pastas extras
// com arquivos .tmLanguage ou .tmLanguage.json, separadas por ";").
const fs = require('fs');
const path = require('path');
const os = require('os');

// ---- Localizacao do VS Code ----
function pastaApp(base) {
  // A instalacao atual guarda resources/app dentro de uma subpasta com hash.
  if (!base || !fs.existsSync(base)) return null;
  const direto = path.join(base, 'resources', 'app');
  if (fs.existsSync(path.join(direto, 'extensions'))) return direto;
  const subs = fs.readdirSync(base)
    .map((d) => path.join(base, d, 'resources', 'app'))
    .filter((p) => fs.existsSync(path.join(p, 'extensions')))
    .sort((x, y) => fs.statSync(y).mtimeMs - fs.statSync(x).mtimeMs);
  return subs[0] || null;
}

function acharVSCode() {
  const candidatos = [process.env.VSCODE_HOME];
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    if (fs.existsSync(path.join(dir, 'code.cmd')) || fs.existsSync(path.join(dir, 'code'))) {
      candidatos.push(path.resolve(dir, '..'));
    }
  }
  const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  candidatos.push(path.join(local, 'Programs', 'Microsoft VS Code'),
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Microsoft VS Code'),
    '/usr/share/code', '/Applications/Visual Studio Code.app/Contents/Resources/app');
  for (const c of candidatos) {
    const app = pastaApp(c);
    if (app) return app;
  }
  return null;
}

const APP = acharVSCode();
const EXT_USUARIO = process.env.VSCODE_EXTENSIONS || path.join(os.homedir(), '.vscode', 'extensions');

// vscode-textmate e vscode-oniguruma: do tools/node_modules ou os embutidos no VS Code
// (estes so carregam rodando com o proprio VS Code como Node, que le o .asar).
function carregar(mod) {
  try { return { m: require(mod), base: path.dirname(require.resolve(mod + '/package.json')) }; } catch (e) { /* segue */ }
  if (APP) {
    try { return { m: require(path.join(APP, 'node_modules.asar', mod)), base: path.join(APP, 'node_modules.asar.unpacked', mod) }; } catch (e) { /* segue */ }
  }
  console.error(`Nao achei ${mod}. Rode "npm install" em tools/ ou use inspecionar.sh.`);
  process.exit(1);
}
const vsctm = carregar('vscode-textmate').m;
const onig = carregar('vscode-oniguruma');

// ---- Catalogo de gramaticas ----
const grammars = {};    // scopeName -> arquivo
const injections = {};  // scopeName alvo -> [scopeName injetado]
const langScope = {};   // id da linguagem -> scopeName
const extLang = {};     // extensao ou nome de arquivo -> [ids de linguagem]
const superTipo = {};   // tipo semantico de extensao -> tipo do qual herda (record -> class)
const escoposSem = {};  // linguagem -> { seletor semantico -> [escopos TextMate] }

function lerExtensao(dir, origem) {
  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')); } catch (e) { return; }
  const c = pkg.contributes || {};
  for (const t of c.semanticTokenTypes || []) if (t.superType) superTipo[t.id] = t.superType;
  for (const s of c.semanticTokenScopes || []) Object.assign(escoposSem[s.language || '*'] = escoposSem[s.language || '*'] || {}, s.scopes);
  for (const l of c.languages || []) {
    for (const e of [...(l.extensions || []), ...(l.filenames || [])]) {
      (extLang[e.toLowerCase()] = extLang[e.toLowerCase()] || []).unshift(l.id);
    }
  }
  for (const g of c.grammars || []) {
    if (!g.scopeName || !g.path) continue;
    const arq = path.join(dir, g.path);
    if (!fs.existsSync(arq)) continue;
    grammars[g.scopeName] = { arq, origem };
    if (g.language) langScope[g.language] = g.scopeName;
    for (const alvo of g.injectTo || []) (injections[alvo] = injections[alvo] || []).push(g.scopeName);
  }
}

function lerPasta(base, origem) {
  if (!base || !fs.existsSync(base)) return;
  for (const d of fs.readdirSync(base).sort()) {
    if (d.startsWith('.')) continue;
    lerExtensao(path.join(base, d), origem);
  }
}

if (APP) lerPasta(path.join(APP, 'extensions'), 'vscode');
lerPasta(EXT_USUARIO, 'usuario');
const extras = [path.join(__dirname, 'gramaticas'), ...(process.env.GRAMATICAS || '').split(';')];
for (const dir of extras) {
  if (!dir || !fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/\.tmLanguage(\.json)?$/.test(f)) continue;
    const p = path.join(dir, f);
    try {
      const raw = vsctm.parseRawGrammar(fs.readFileSync(p, 'utf8'), p);
      if (!grammars[raw.scopeName]) grammars[raw.scopeName] = { arq: p, origem: 'extra' };
    } catch (e) { /* ignora */ }
  }
}

// ---- Tema e nomes das cores ----
const theme = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const nameOf = {};
try {
  // Le P e D do build_theme.py para mostrar "accent", "D.blue" etc. no lugar do hexadecimal.
  const py = fs.readFileSync(path.join(__dirname, '..', 'build_theme.py'), 'utf8');
  for (const [dict, prefixo] of [['D', 'D.'], ['P', '']]) {
    const bloco = py.match(new RegExp(`^${dict} = \\{([\\s\\S]*?)^\\}`, 'm'));
    if (!bloco) continue;
    for (const m of bloco[1].matchAll(/"(\w+)":\s*"(#[0-9a-fA-F]{6})"/g)) nameOf[m[2].toUpperCase()] = prefixo + m[1];
  }
} catch (e) { /* sem nomes */ }
const rotulo = (hex) => nameOf[hex.toUpperCase()] || hex.toUpperCase();

// ---- Modo --listar ----
if (process.argv[3] === '--listar') {
  console.log('VS Code:', APP || '(nao encontrado)');
  console.log('Extensoes do usuario:', EXT_USUARIO);
  for (const s of Object.keys(grammars).sort()) console.log(`${s.padEnd(40)} ${grammars[s].origem.padEnd(8)} ${grammars[s].arq}`);
  process.exit(0);
}

// ---- Modo --semantico: resolve tokens semanticos como o VS Code ----
// Pontuacao das regras: tipo exato 100, cada modificador 100, linguagem 10.
// Sem regra semantica, cai no escopo TextMate equivalente (tabela do VS Code).
const FALLBACK = {
  comment: ['comment'], string: ['string'], keyword: ['keyword.control'], number: ['constant.numeric'],
  regexp: ['constant.regexp'], operator: ['keyword.operator'], namespace: ['entity.name.namespace'],
  type: ['entity.name.type', 'support.type'], struct: ['entity.name.type.struct'],
  class: ['entity.name.type.class', 'support.class'], interface: ['entity.name.type.interface'],
  enum: ['entity.name.type.enum'], typeParameter: ['entity.name.type.parameter'],
  function: ['entity.name.function', 'support.function'], member: ['entity.name.function.member', 'support.function'],
  method: ['entity.name.function.member', 'support.function'], macro: ['entity.name.function.preprocessor'],
  variable: ['variable.other.readwrite', 'entity.name.variable'], parameter: ['variable.parameter'],
  property: ['variable.other.property'], enumMember: ['variable.other.enummember'], event: ['variable.other.event'],
  decorator: ['entity.name.decorator', 'entity.name.function'], label: ['entity.name.label'],
  'variable.readonly': ['variable.other.constant'], 'property.readonly': ['variable.other.constant.property'],
  'type.defaultLibrary': ['support.type'], 'class.defaultLibrary': ['support.class'],
  'interface.defaultLibrary': ['support.class'], 'variable.defaultLibrary': ['support.variable', 'support.other.variable'],
  'variable.readonly.defaultLibrary': ['support.constant'], 'property.defaultLibrary': ['support.variable.property'],
  'property.readonly.defaultLibrary': ['support.constant.property'], 'function.defaultLibrary': ['support.function'],
  'member.defaultLibrary': ['support.function'],
};

function corDeEscopo(escopo) {
  // Regra TextMate mais especifica (prefixo mais longo) que casa com um escopo isolado.
  let melhor = null, tam = -1;
  for (const r of theme.tokenColors) {
    for (const sel of [].concat(r.scope || [])) {
      if (sel.includes(' ')) continue;
      if ((escopo === sel || escopo.startsWith(sel + '.')) && sel.length > tam && r.settings.foreground) {
        melhor = r.settings; tam = sel.length;
      }
    }
  }
  return melhor;
}

function regraSemantica(lang, tipo, mods, soEspecifica) {
  let melhor = null, pontos = -1, seletor = null;
  for (const [sel, val] of Object.entries(theme.semanticTokenColors || {})) {
    const [corpo, slang] = sel.split(':');
    const [st, ...smods] = corpo.split('.');
    if (slang && slang !== lang) continue;
    if (st === '*' ? soEspecifica : st !== tipo) continue;
    if (!smods.every((m) => mods.includes(m))) continue;
    const p = (st === '*' ? 0 : 100) + smods.length * 100 + (slang ? 10 : 0);
    const cor = typeof val === 'string' ? val : val.foreground;
    if (p > pontos && (cor || !soEspecifica)) { pontos = p; melhor = val; seletor = sel; }
  }
  return { melhor, seletor };
}

function resolverSemantico(lang, token) {
  const [tipo, ...mods] = token.split('.');
  // Tipos declarados por extensoes herdam a cor do supertipo quando o tema nao os cita.
  let { melhor, seletor } = regraSemantica(lang, tipo, mods, false);
  for (let t = superTipo[tipo]; t && !(typeof melhor === 'string' || melhor?.foreground); t = superTipo[t]) {
    const r = regraSemantica(lang, t, mods, true);
    if (r.melhor) ({ melhor, seletor } = r);
  }
  const estilo = typeof melhor === 'string' ? { foreground: melhor } : (melhor || {});
  if (estilo.foreground) return { cor: estilo.foreground, via: seletor, estilo };
  // Sem cor semantica: escopos TextMate que a extensao da linguagem declara para o token.
  for (const [chave, escopos] of Object.entries({ ...(escoposSem['*'] || {}), ...(escoposSem[lang] || {}) })) {
    const [ct, ...cmods] = chave.split('.');
    if ((ct !== '*' && ct !== tipo) || !cmods.every((m) => mods.includes(m))) continue;
    for (const esc of escopos) {
      const s = corDeEscopo(esc);
      if (s) return { cor: s.foreground, via: `${seletor || '-'} / extensao ${esc}`, estilo: { ...s, ...estilo } };
    }
  }
  // Depois, a tabela padrao do VS Code, da chave mais especifica para a mais geral.
  for (let n = mods.length; n >= 0; n--) {
    const chave = [tipo, ...mods.slice(0, n)].join('.');
    for (const esc of FALLBACK[chave] || []) {
      const s = corDeEscopo(esc);
      if (s) return { cor: s.foreground, via: `${seletor || '-'} / textmate ${esc}`, estilo: { ...s, ...estilo } };
    }
  }
  return { cor: theme.colors['editor.foreground'], via: 'padrao', estilo };
}

if (process.argv[3] === '--semantico') {
  const lang = process.argv[4];
  for (const t of process.argv.slice(5)) {
    const r = resolverSemantico(lang, t);
    const fs_ = [r.estilo.italic && 'italico', r.estilo.bold && 'negrito', r.estilo.strikethrough && 'riscado', r.estilo.fontStyle].filter(Boolean).join(' ');
    console.log(`${t.padEnd(40)} ${rotulo(r.cor).padEnd(14)} ${fs_.padEnd(10)} ${r.via}`);
  }
  process.exit(0);
}

// ---- Tokenizacao ----
const wasm = fs.readFileSync(path.join(onig.base, 'release', 'onig.wasm')).buffer;
const onigLib = onig.m.loadWASM(wasm).then(() => ({
  createOnigScanner: (s) => new onig.m.OnigScanner(s),
  createOnigString: (s) => new onig.m.OnigString(s),
}));

const registry = new vsctm.Registry({
  onigLib,
  loadGrammar: async (scope) => grammars[scope]
    ? vsctm.parseRawGrammar(fs.readFileSync(grammars[scope].arq, 'utf8'), grammars[scope].arq) : null,
  getInjections: (scope) => injections[scope] || [],
});
registry.setTheme({
  name: 'occhio',
  settings: [{ settings: { foreground: theme.colors['editor.foreground'], background: theme.colors['editor.background'] } },
    ...theme.tokenColors],
});
const cmap = registry.getColorMap();
const ESTILOS = ['i', 'b', 'u', 's'];

// Linguagem de um arquivo pela extensao, como o VS Code; os casos abaixo nao
// tem associacao padrao e por isso sao indicados aqui.
const ASSOCIACOES = { 'exemplo.env': 'dotenv', 'exemplo.gitignore': 'ignore' };
function escopoDoArquivo(arq) {
  const nome = path.basename(arq).toLowerCase();
  // Varias extensoes podem registrar a mesma terminacao; vale a ultima que tem gramatica.
  const comGramatica = (chave) => [].concat(ASSOCIACOES[chave] || extLang[chave] || []).find((l) => langScope[l]);
  let lang = comGramatica(nome);
  for (let i = nome.indexOf('.'); !lang && i >= 0; i = nome.indexOf('.', i + 1)) lang = comGramatica(nome.slice(i));
  return lang && langScope[lang];
}

async function tokenizar(scope, file, mode, escrever) {
  const grammar = await registry.loadGrammar(scope);
  const lines = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split('\n');
  let st1 = vsctm.INITIAL, st2 = vsctm.INITIAL;
  const seen = new Map();
  const console = { log: escrever };
  for (const line of lines) {
    const r1 = grammar.tokenizeLine(line, st1); st1 = r1.ruleStack;
    const r2 = grammar.tokenizeLine2(line, st2); st2 = r2.ruleStack;
    const meta = (idx) => { let m = r2.tokens[1]; for (let i = 0; i < r2.tokens.length; i += 2) if (r2.tokens[i] <= idx) m = r2.tokens[i + 1]; return m; };
    for (const t of r1.tokens) {
      const text = line.slice(t.startIndex, t.endIndex);
      if (!text.trim()) continue;
      const m = meta(t.startIndex);
      const fg = cmap[(m & 0xFF8000) >>> 15];
      const fsBits = (m & 0x7800) >>> 11;
      const estilo = ESTILOS.filter((_, i) => fsBits & (1 << i)).join('');
      const label = rotulo(fg) + (estilo ? ' ' + estilo : '');
      const sc = t.scopes.slice(1).join(' > ');
      if (mode === 'all') console.log(`${JSON.stringify(text).padEnd(28)} ${label.padEnd(16)} ${sc}`);
      else if (mode === 'escopos') {
        // Uma linha por combinacao de escopo final e cor, com um texto de exemplo.
        const ultimo = t.scopes.length > 1 ? t.scopes[t.scopes.length - 1] : '(sem escopo)';
        const key = ultimo + '|' + label;
        if (!seen.has(key)) {
          seen.set(key, true);
          console.log(`${label.padEnd(16)} ${ultimo.padEnd(62)} ${JSON.stringify(text).slice(0, 30)}`);
        }
      } else {
        const key = text.trim() + '|' + label;
        if (!seen.has(key)) seen.set(key, sc);
      }
    }
  }
  if (mode !== 'all' && mode !== 'escopos') for (const [k, sc] of seen) { const [txt, lab] = k.split('|'); console.log(`${JSON.stringify(txt).padEnd(28)} ${lab.padEnd(16)} ${sc}`); }
}

(async () => {
  let [scope, file, mode] = process.argv.slice(3);
  if (scope === '--todas') {
    // Grava a saida completa de cada amostra em <pasta>, para comparar entre versoes.
    const amostras = path.join(__dirname, '..', 'samples');
    const saida = file;
    if (saida) fs.mkdirSync(saida, { recursive: true });
    for (const f of fs.readdirSync(amostras).sort()) {
      const arq = path.join(amostras, f);
      if (!fs.statSync(arq).isFile()) continue;
      const esc = escopoDoArquivo(arq);
      if (!esc || !grammars[esc]) { console.log(`${f.padEnd(28)} sem gramatica`); continue; }
      const linhas = [];
      await tokenizar(esc, arq, 'all', (l) => linhas.push(l));
      if (saida) fs.writeFileSync(path.join(saida, f + '.txt'), linhas.join('\n') + '\n');
      console.log(`${f.padEnd(28)} ${esc.padEnd(24)} ${linhas.length} tokens`);
    }
    return;
  }
  if (!grammars[scope] && langScope[scope]) scope = langScope[scope];
  if (!grammars[scope]) {
    console.error(`Escopo ou linguagem desconhecido: ${scope}. Veja "node inspecionar.js <tema> --listar".`);
    process.exit(1);
  }
  await tokenizar(scope, file, mode, (l) => console.log(l));
})();
