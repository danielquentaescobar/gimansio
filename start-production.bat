@echo off
echo ============================================
echo        INICIANDO GIMNASIO APP
echo ============================================
echo.
echo Configuracion de puertos:
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3001
echo.

REM Detener procesos Node.js existentes
echo Deteniendo procesos Node.js existentes...
taskkill /f /im node.exe >nul 2>&1

REM Crear directorio de logs si no existe
if not exist "logs" mkdir logs

echo Construyendo frontend...
cd frontend-gym
call npm run build
cd ..

echo Iniciando Backend en puerto 3000...
start "Gimnasio Backend" /min cmd /c "cd backend-gym && set PORT=3000 && npm start"

echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando Frontend en puerto 3001...
start "Gimnasio Frontend" /min cmd /c "cd frontend-gym && set PORT=3001 && npm start"

echo.
echo ============================================
echo        APLICACION INICIADA CORRECTAMENTE
echo ============================================
echo.
echo Backend API: http://localhost:3000
echo Frontend:    http://localhost:3001
echo.
echo IMPORTANTE: No cerrar las ventanas de comando que se abrieron
echo            para mantener los servicios corriendo.
echo.
echo Para ver el estado ejecuta: status.bat
echo Para detener ejecuta: stop.bat
echo.

pause