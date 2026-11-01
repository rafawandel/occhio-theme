# Rotina de limpeza de arquivos antigos
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Pasta,
    [int]$Dias = 30
)

$ErrorActionPreference = 'Stop'
$limite = (Get-Date).AddDays(-$Dias)

function Remove-Antigos {
    param([string]$Caminho)
    Get-ChildItem -Path $Caminho -File -Recurse |
        Where-Object { $_.LastWriteTime -lt $limite } |
        ForEach-Object {
            Write-Verbose "Removendo $($_.FullName)"
            Remove-Item $_.FullName -Force
        }
}

if (-not (Test-Path $Pasta)) {
    Write-Error "Pasta $Pasta nao existe"
    exit 1
}

try {
    Remove-Antigos -Caminho $Pasta
    $total = @(Get-ChildItem $Pasta).Count
    Write-Host "Restaram $total arquivos" -ForegroundColor Cyan
} catch [System.IO.IOException] {
    Write-Warning $_.Exception.Message
}
$env:ULTIMA_LIMPEZA = [datetime]::Now.ToString('yyyy-MM-dd')
