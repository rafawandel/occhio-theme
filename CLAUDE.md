# Tema Occhio para VS Code

Tema escuro (fundo azul-noite, destaque ciano). Leia README.md e CHANGELOG.md antes de mudar algo.

## Regras

- **Sigilo:** nenhum arquivo do projeto pode conter nome ou referencia a empresa, cliente, fornecedor, sistema interno, tabela, schema, servidor, loja ou pessoa dos projetos de trabalho do autor. Vale para codigo, amostras, comentarios, documentacao, este arquivo, nomes de arquivos e mensagens de commit. As unicas excecoes sao nomes tecnicos obrigatorios de linguagens, ferramentas e escopos de gramatica (PL/SQL, VS Code, source.plsql.oracle etc.). Amostras usam dominios neutros e genericos (hoje, um acervo de biblioteca). O nome Occhio e liberado pelo autor e pode aparecer em qualquer lugar, inclusive na publicacao. Projetos de trabalho podem ser consultados so para descobrir linguagens e extensoes, nunca para copiar trechos ou identificadores.
- **Cores:** nunca edite `themes/occhio-color-theme.json` a mao. Edite `build_theme.py` e rode `python build_theme.py`.
- **Paleta:** nao altere as cores de `P` (extraidas do app). Tons novos vao so em `D`, na mesma familia fria.
- **Contraste:** cores de texto com no minimo 4,5:1 sobre o fundo do editor (`python tools/contraste.py`).
- **Texto:** use so caracteres do teclado ABNT pt-BR em textos, comentarios e docs. Nada de travessao longo, setas, sinal de multiplicacao ou aspas tipograficas.

## Fluxo para ajustar uma linguagem

1. Crie ou atualize a amostra em `samples/` (dominio neutro, construcoes variadas da linguagem).
2. Guarde a linha de base: `node tools/inspecionar.js themes/occhio-color-theme.json --todas <pasta-antes>`.
3. Inspecione: `node tools/inspecionar.js themes/occhio-color-theme.json <linguagem> samples/<arquivo> escopos` (ou `all`).
4. Corrija as regras em `build_theme.py` (bloco de regras por linguagem, no fim de `token_colors`, e `semantic`), rode `python build_theme.py` e reinspecione.
5. Para o realce semantico: `node tools/inspecionar.js themes/occhio-color-theme.json --semantico <linguagem> <tipo.modificador> ...`.
6. Rode `--todas` de novo numa outra pasta e compare com a linha de base. Mudancas em linguagens que voce nao mexeu sao regressao.
7. Rode `python tools/contraste.py`.

## Ferramentas

- `tools/inspecionar.js` usa as gramaticas do VS Code instalado (`resources/app/extensions`) e das extensoes do usuario (`%USERPROFILE%\.vscode\extensions`). As do usuario prevalecem, como no editor (a do Pylance substitui a MagicPython). `VSCODE_HOME`, `VSCODE_EXTENSIONS` e `GRAMATICAS` mudam os caminhos.
- Precisa de `vscode-textmate` e `vscode-oniguruma` (`npm install` em `tools/`). Sem Node, `tools/inspecionar.sh` roda o script com o proprio VS Code como Node e usa as bibliotecas embutidas nele.
- Extensoes de linguagem instaladas para conferir o tema estao listadas no README (Extensoes recomendadas). Elas mudam a tokenizacao: a de PL/SQL assume os .sql, e as de Vue e Angular injetam gramatica no HTML e no TypeScript. Para regressao, compare duas versoes do tema com as mesmas extensoes instaladas.
- `.vscode/settings.json` impede que a extensao Java importe `samples/build.gradle` e `samples/pom.xml` como projetos (isso criava `samples/.gradle`).
- `--semantico` considera os supertipos e os escopos declarados pelas extensoes (por exemplo, `record` herda de `class` no Java).
- O VS Code aceita o combinador de filho direto (`>`) nos seletores de tema; use quando um escopo generico so deve casar num nivel especifico.
- O mapeamento extensao para linguagem segue os `package.json` das extensoes; casos sem associacao padrao ficam em `ASSOCIACOES` no script.

## Publicacao

1. Suba a versao em `package.json` e descreva as mudancas no `CHANGELOG.md` e, se for o caso, no README.
2. `npx @vscode/vsce package` (o campo `repository` ja esta preenchido).
3. Antes de entregar, busque sem diferenciar maiusculas e minusculas, nos arquivos do projeto e dentro do .vsix (e um zip), por nomes ligados aos projetos de trabalho, conforme a regra de sigilo. Repita ate nao sobrar nada.
