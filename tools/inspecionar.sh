#!/usr/bin/env bash
# Roda o inspecionar.js com o Node, ou com o proprio VS Code como Node quando
# o Node nao estiver instalado (assim usa o vscode-textmate embutido no editor).
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1 && [ -d node_modules/vscode-textmate ]; then
    exec node inspecionar.js "$@"
fi
CODE=""
for c in "$VSCODE_HOME/Code.exe" "$LOCALAPPDATA/Programs/Microsoft VS Code/Code.exe" \
         "/c/Program Files/Microsoft VS Code/Code.exe" "/usr/share/code/code" \
         "/Applications/Visual Studio Code.app/Contents/MacOS/Electron"; do
    [ -x "$c" ] && CODE="$c" && break
done
[ -z "$CODE" ] && { echo "Nao achei o Node nem o VS Code" >&2; exit 1; }
ELECTRON_RUN_AS_NODE=1 exec "$CODE" inspecionar.js "$@"
