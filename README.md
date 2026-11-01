# Occhio

Tema escuro para o VS Code baseado no visual Occhio: fundo azul-noite quase preto, destaque em ciano e cores de status bem separadas (verde para ok, ambar para atencao, vermelho para erro).

## Paleta

| Papel | Cor |
| --- | --- |
| Fundo do editor | `#080c10` |
| Superficie (lateral, abas, painel) | `#0e1419` |
| Superficie elevada (inputs, hover) | `#141c24` |
| Bordas | `#1f2d3d` / `#2a3f55` |
| Destaque | `#00d4ff` |
| Sucesso | `#00e676` |
| Atencao | `#ffb300` |
| Erro | `#ff3d57` |
| Texto | `#c8d8e8` |
| Texto secundario | `#6787a2` (o `#5a7a94` do app, clareado para chegar a 4,5:1) |

## Sintaxe

Palavras-chave em ciano, funcoes em ciano claro, tipos e classes em azul, strings em verde, numeros, constantes, decorators e anotacoes em ambar, propriedades e chaves em azul-acinzentado, comentarios em italico. Variaveis especiais (self, cls, this, :NEW de trigger, variaveis de shell, PowerShell, Batch e CSS, ancoras de YAML, delimitadores de Jinja) e pre-processador ficam em violeta. Os delimitadores `{{ }}` de Vue e Angular ficam em ambar, como o `${` das template strings.

### Linguagens conferidas

Todas as regras foram conferidas contra as gramaticas que o VS Code realmente usa (as embutidas no editor e as das extensoes instaladas):

- **Web e JavaScript:** JavaScript, TypeScript, JSX e TSX (React e React Native), Angular (TypeScript e templates), Vue, HTML, CSS, SCSS, JSON e JSON com comentarios.
- **Back-end:** Python (gramatica do Pylance), Java, C#, SQL e PL/SQL.
- **Templates e testes:** Jinja, Gherkin (`.feature`) e requisicoes `.http` do REST Client.
- **Build e configuracao:** Maven (XML), Gradle (Groovy), TOML, `.properties`, INI, dotenv, YAML, Dockerfile, justfile, `requirements.txt` e `.gitignore`.
- **Scripts:** Shell, PowerShell e Batch.
- **Outros:** Markdown, arquivos `.log` e CSV (cores das colunas da extensao Rainbow CSV).

O realce semantico tambem foi ajustado para TypeScript e JavaScript (o `const` local nao fica amarelo como constante), Python (Pylance), C# e Java (constantes static final em ambar, variaveis final locais na cor de texto, anotacoes em ambar).

### Extensoes recomendadas

O tema so colore o que a gramatica marca. Algumas linguagens precisam de extensao para ter gramatica, e as regras do tema foram conferidas com estas:

| Linguagem | Extensao |
| --- | --- |
| Python (gramatica e realce semantico) | `ms-python.vscode-pylance` |
| PL/SQL | `xyz.plsql-language` |
| Templates Angular (`{{ }}`, `@if`, `*ngFor`) | `Angular.ng-template` |
| Vue | `Vue.volar` |
| Jinja | `samuelcolvin.jinjahtml` |
| TOML | `tamasfe.even-better-toml` |
| Gherkin | `alexkrechik.cucumberautocomplete` |
| Requisicoes `.http` | `humao.rest-client` |
| justfile | `nefrob.vscode-just-syntax` |
| Realce semantico de Java | `redhat.java` (traz JRE embutido; JDK so para compilar) |
| CSV (cores por coluna) | `mechatroner.rainbow-csv` |

Sem a extensao de PL/SQL, arquivos `.sql` usam a gramatica SQL embutida, que nao reconhece boa parte do PL/SQL (`PACKAGE BODY`, `PLS_INTEGER`, `PRAGMA`). A extensao associa `.sql`, `.pkb`, `.pks` e similares ao PL/SQL.

A extensao de Jinja so vale para `.jinja`, `.j2` e similares. Para templates com extensao `.html`, associe a linguagem no `settings.json`, por exemplo:

```json
{
  "files.associations": { "**/templates/**/*.html": "jinja-html" }
}
```

O contraste segue a WCAG: texto principal em 13,5:1, comentarios e demais cores de sintaxe acima de 4,5:1.

## Fonte recomendada

O visual Occhio usa IBM Plex Mono. Para ficar igual, instale a fonte e adicione ao `settings.json`:

```json
{
  "editor.fontFamily": "'IBM Plex Mono', Consolas, monospace",
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "terminal.integrated.fontFamily": "'IBM Plex Mono', Consolas, monospace"
}
```

## Instalacao

Pelo Marketplace: procure por **Occhio** na aba de extensoes.

Pelo arquivo `.vsix`: na aba de extensoes, menu `...` e depois **Install from VSIX...**, ou pelo terminal:

```bash
code --install-extension occhio-theme-0.3.0.vsix
```

Depois selecione o tema com `Ctrl+K Ctrl+T`.

## Desenvolvimento

As cores ficam todas no `build_theme.py`. Depois de editar, rode `python build_theme.py` para regenerar `themes/occhio-color-theme.json`.

A pasta `samples/` tem um arquivo de exemplo por linguagem. Para conferir visualmente, aperte F5 no projeto: abre uma janela do VS Code com o tema em desenvolvimento carregado (configuracao em `.vscode/launch.json`). Selecione **Occhio** nela e abra as amostras.

Para conferir sem abrir o VS Code, `tools/inspecionar.js` tokeniza as amostras com as gramaticas instaladas e mostra a cor e o escopo de cada token. Ele encontra sozinho a pasta de instalacao do VS Code e a pasta de extensoes do usuario (as variaveis `VSCODE_HOME` e `VSCODE_EXTENSIONS` mudam esses caminhos).

```bash
cd tools
npm install          # ou use ./inspecionar.sh, que roda com o proprio VS Code se nao houver Node
node inspecionar.js ../themes/occhio-color-theme.json typescriptreact ../samples/Painel.tsx
```

O segundo argumento aceita o id da linguagem (`python`, `sql`, `typescriptreact`, `java`...) ou o escopo (`source.python`). No fim, `all` lista todos os tokens e `escopos` mostra uma linha por escopo e cor. Outros modos:

```bash
node inspecionar.js ../themes/occhio-color-theme.json --listar                  # gramaticas encontradas
node inspecionar.js ../themes/occhio-color-theme.json --todas saida/            # todas as amostras, um arquivo por amostra
node inspecionar.js ../themes/occhio-color-theme.json --semantico typescript variable.readonly
python contraste.py                                                             # contraste das cores de sintaxe
```

Para checar regressao, rode `--todas` antes e depois de mudar o tema e compare as duas pastas.
