@echo off
echo ============================================
echo    🔴 DESACTIVANDO INICIO AUTOMATICO
echo ============================================
echo.

echo 🔄 Removiendo configuraciones de inicio automático...
echo.

REM Eliminar del startup folder
set "startupFolder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
if exist "%startupFolder%\GimnasioApp-AutoStart.bat" (
    del "%startupFolder%\GimnasioApp-AutoStart.bat"
    echo ✅ Removido del directorio de inicio
) else (
    echo ℹ️  No se encontró configuración en el directorio de inicio
)

REM Eliminar tarea programada si existe
schtasks /query /tn "GimnasioApp" >nul 2>&1
if %errorlevel% equ 0 (
    schtasks /delete /tn "GimnasioApp" /f >nul 2>&1
    echo ✅ Tarea programada eliminada
) else (
    echo ℹ️  No hay tarea programada configurada
)

echo.
echo ============================================
echo        ✅ INICIO AUTOMATICO DESACTIVADO
echo ============================================
echo.
echo 🔒 La aplicación ya NO se iniciará automáticamente al encender la PC.
echo.
echo 💡 Para usar la aplicación manualmente:
echo    Ejecuta: start-hidden.bat
echo.
echo 🔄 Para reactivar el inicio automático:
echo    Ejecuta: configurar-inicio-automatico.bat
echo.

pause