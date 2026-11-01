# Changelog

## 0.3.0

- Regras para JavaScript, TypeScript, JSX e TSX (React e React Native), Angular, HTML, CSS, SCSS, JSON, Java, Maven, Gradle, properties, INI, dotenv, Markdown, PowerShell, Batch, arquivos .log, requirements.txt, .gitignore e CSV (Rainbow CSV).
- Python conferido com a gramatica do Pylance, que substitui a do VS Code quando a extensao esta instalada. Decorators como @property e @classmethod agora em ambar.
- Realce semantico de TypeScript e JavaScript: variaveis const locais na cor de texto, em vez de amarelo; bibliotecas padrao seguem em azul. Anotacoes do Java em ambar.
- Decorators do Angular e TypeScript e anotacoes do Java na mesma cor dos decorators do Python.
- Campos de classe e de interface em JS e TS na cor de propriedades.
- Tipos referenciados e pacotes do Java em azul, em vez da cor de palavra-chave.
- Unidades CSS na cor de numeros; variaveis CSS e SCSS em violeta; seletores sem italico.
- Variaveis de PowerShell e Batch em violeta, como no Shell. Chaves de INI, properties e dotenv na cor de propriedades.
- Arquivos .log com erro em vermelho, aviso em ambar e info em ciano (antes as cores vinham trocadas).
- tools/inspecionar.js usa as gramaticas instaladas no VS Code em vez de baixar, aceita id de linguagem e ganhou os modos --listar, --todas, --semantico e escopos. Pode rodar com o proprio VS Code como Node (inspecionar.sh).
- tools/contraste.py confere o contraste de todas as cores de sintaxe.
- PL/SQL conferido com a gramatica atual da extensao xyz.plsql-language, que tambem passa a abrir os arquivos .sql.
- Regras para Vue, templates Angular, Jinja, TOML, Gherkin, REST Client (.http) e justfile, conferidas com as extensoes dessas linguagens. Delimitadores {{ }} de Vue e Angular em ambar; delimitadores de Jinja em violeta.
- Realce semantico de Java conferido com os tipos da extensao da Red Hat: constantes static final em ambar, variaveis final locais na cor de texto, records na cor de classes. Chaves de .properties na cor de propriedades tambem com a gramatica dessa extensao.
- README com a lista de extensoes recomendadas.
- Amostras novas em samples/ para cada linguagem.

## 0.2.0

- Regras especificas para PL/SQL (extensao PL/SQL de xyz.plsql-language), SQL, Python, C#, YAML, Shell e Dockerfile, conferidas com as gramaticas reais.
- Tipos primitivos (int, string, NUMBER, VARCHAR2) agora na cor de tipos, nao mais na de palavras-chave.
- Colunas e aliases de SQL em tons discretos, em vez de amarelo.
- Variaveis de shell, ancoras de YAML, pre-processador de C# e :NEW/:OLD de trigger em violeta.
- Realce semantico ampliado (Pylance e C#): module, clsParameter, builtinConstant, field, event e outros.
- Contraste corrigido: comentarios e textos secundarios acima de 4,5:1, numeros de linha em 3:1.
- Cores para notebooks, console de debug, chat do Copilot, terminal, sticky scroll e diff de varios arquivos.
- Pasta samples/ com arquivos de exemplo e tools/ para conferir o tema contra as gramaticas.

## 0.1.0

- Primeira versao do tema Occhio para VS Code.
