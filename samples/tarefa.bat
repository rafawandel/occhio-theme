@echo off
REM Tarefa agendada de exemplo
setlocal enabledelayedexpansion

set PASTA=%~dp0saida
set /a CONTADOR=0

if not exist "%PASTA%" mkdir "%PASTA%"

for %%f in (*.log) do (
    set /a CONTADOR+=1
    copy "%%f" "%PASTA%\" >nul
    echo Copiado !CONTADOR!: %%f
)

:: Chama outra rotina
call :resumo
goto :eof

:resumo
echo Total: %CONTADOR% arquivos
exit /b 0
