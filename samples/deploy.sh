#!/usr/bin/env bash
# Publica a aplicacao no ambiente de testes
set -euo pipefail

AMBIENTE="${1:-teste}"
DESTINO=/opt/apps/exemplo
readonly ARQ_LOG="$DESTINO/logs/publicacao_$(date +%Y%m%d).log"

log() {
    local nivel=$1; shift
    echo "[$(date '+%H:%M:%S')] [$nivel] $*" | tee -a "$ARQ_LOG"
}

if [[ ! -d "$DESTINO" ]]; then
    log ERRO "Diretorio $DESTINO nao existe"
    exit 1
fi

for servico in api fila; do
    docker compose -f docker-compose.yml restart "$servico" 2>/dev/null || log AVISO "falha em $servico"
done

case "$AMBIENTE" in
    teste|local) log INFO "Publicacao em testes" ;;
    producao) log INFO "Publicacao em producao" ;;
    *) log ERRO "Ambiente invalido: $AMBIENTE"; exit 2 ;;
esac

export PATH="$HOME/.local/bin:$PATH"
total=$(( $(wc -l < "$ARQ_LOG") + 1 ))
echo "Linhas no log: ${total}"
