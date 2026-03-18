@echo off
:: Aqui injetamos o Git e o System32 na marra para o Flutter não chorar
set "PATH=C:\Windows\System32;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;G:\flutter\flutter\bin;%PATH%"

cd /d "G:\eleicao_pesquisa"

echo ==========================================
echo    INICIALIZADOR DO PROJETO ELEICAO
echo ==========================================
echo.
echo 1. Instalando bibliotecas (Provider, Hive, fl_chart)...
:: Mudança importante: chame o flutter.bat direto para garantir
call flutter pub get

echo.
echo 2. Iniciando aplicativo no Chrome...
call flutter run -d chrome

echo.
echo Pressione qualquer tecla para fechar...
pause