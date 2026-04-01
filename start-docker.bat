@echo off
echo ========================================
echo  Master Sport - Docker Setup
echo ========================================
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta corriendo.
    echo Por favor, inicia Docker Desktop y vuelve a ejecutar este script.
    pause
    exit /b 1
)

echo [1/5] Verificando Docker... OK
echo.

echo [2/5] Deteniendo servicios previos...
docker-compose down >nul 2>&1
echo.

echo [3/5] Construyendo imagenes...
docker-compose build
echo.

echo [4/5] Iniciando servicios (PostgreSQL + Backend)...
docker-compose up -d
echo.

echo [5/5] Esperando que los servicios esten listos...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo  Estado de los servicios:
echo ========================================
docker-compose ps
echo.

echo ========================================
echo  Probando conexion...
echo ========================================
curl -s http://localhost:3000/api/health
echo.
echo.

echo ========================================
echo  LISTO! 
echo ========================================
echo.
echo  Backend API: http://localhost:3000
echo  Salud: http://localhost:3000/api/health
echo.
echo  Usuarios de prueba:
echo  - test@test.com / test123
echo  - admin@mastersport.app / admin123
echo.
echo  Ver logs:
echo    docker-compose logs -f
echo.
echo  Detener:
echo    docker-compose down
echo.
echo ========================================

pause
