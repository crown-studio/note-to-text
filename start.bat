@echo off
REM Verifica a versão atual do Node.js
for /f "tokens=*" %%i in ('node -v') do (
    set "node_version=%%i"
)

REM Necessário para garantir que a variável seja expandida corretamente
setlocal enabledelayedexpansion

REM Exibe a versão atual do Node.js
echo Current Node.js version: !node_version!

REM Verifica se a versão atual não começa com "v14" e define para 14 se necessário
if not "!node_version:~0,3!"=="v14" (
    echo Setting Node.js version to 14
    nvm use 14
    timeout /t 2 /nobreak
) else (
    echo Node.js version is already 14.x
)

node main
pause