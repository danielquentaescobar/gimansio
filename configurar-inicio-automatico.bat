@echo off
echo ============================================
echo    ⚙️  CONFIGURANDO INICIO AUTOMATICO
echo ============================================
echo.

REM Obtener la carpeta de inicio de Windows
set "startupFolder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo 🔧 Creando script de inicio automático...

REM Crear un script que se ejecute al inicio
echo @echo off > "%startupFolder%\GimnasioApp-AutoStart.bat"
echo timeout /t 10 /nobreak ^>nul >> "%startupFolder%\GimnasioApp-AutoStart.bat"
echo cd /d "C:\Users\lenovo\Desktop\Gimnasio" >> "%startupFolder%\GimnasioApp-AutoStart.bat"
echo start-hidden.bat >> "%startupFolder%\GimnasioApp-AutoStart.bat"

echo.
echo ============================================
echo        ✅ CONFIGURACION COMPLETADA
echo ============================================
echo.
echo 🚀 La aplicación del gimnasio se iniciará automáticamente
echo    cada vez que enciendas tu PC de forma COMPLETAMENTE OCULTA.
echo.
echo 🌐 URLs que estarán disponibles automáticamente:
echo   📡 Backend:  http://localhost:3000
echo   🖥️  Frontend: http://localhost:3001
echo.
echo ⏰ Al encender tu PC:
echo   1. Espera 10 segundos después del inicio
echo   2. La aplicación se iniciará automáticamente
echo   3. Procesos completamente ocultos e invisibles
echo   4. Ve directamente a http://localhost:3001
echo.
echo 🔧 Para desactivar el inicio automático:
echo    Ejecuta: desactivar-inicio-automatico.bat
echo.
echo 🛑 Para detener servicios manualmente:
echo    Ejecuta: stop.bat
echo.

pause