# Master Sport - Docker Setup

## 🚀 Inicio Rápido con Docker

### Prerrequisitos
- Docker Desktop instalado (https://www.docker.com/products/docker-desktop)
- 4GB RAM disponible mínimo

### Levantar la aplicación

```bash
# 1. Navegar a la carpeta backend
cd "D:\Trabajo\App deportiva\backend"

# 2. Levantar todos los servicios (PostgreSQL + Backend)
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Ver logs solo del backend
docker-compose logs -f backend

# 5. Ver logs solo de PostgreSQL
docker-compose logs -f postgres
```

### Detener la aplicación

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (borra la base de datos)
docker-compose down -v
```

### Verificar que está funcionando

```bash
# Health check
curl http://localhost:3000/api/health

# Debería responder:
# {"status":"OK","timestamp":"..."}
```

## 📊 Usuarios de Prueba

La base de datos se crea automáticamente con estos usuarios:

| Email | Password | Rol |
|-------|----------|-----|
| admin@mastersport.app | admin123 | super_admin |
| test@test.com | test123 | user |
| user1@test.com | test123 | user |
| user2@test.com | test123 | user |

## 🔧 Comandos Útiles

```bash
# Reiniciar solo el backend (sin borrar BD)
docker-compose restart backend

# Reconstruir imagen del backend
docker-compose build backend

# Entrar al contenedor de PostgreSQL
docker exec -it master-sport-db psql -U postgres -d master_sport_db

# Ver todas las tablas
docker exec -it master-sport-db psql -U postgres -d master_sport_db -c "\dt"

# Ver usuarios
docker exec -it master-sport-db psql -U postgres -d master_sport_db -c "SELECT email, username, role FROM users;"

# Ver partidos próximos
docker exec -it master-sport-db psql -U postgres -d master_sport_db -c "SELECT * FROM matches WHERE match_date > NOW() ORDER BY match_date LIMIT 5;"

# Resetear base de datos (eliminar y recrear)
docker-compose down -v
docker-compose up -d
```

## 📱 Configurar Frontend

En tu archivo `frontend/src/constants/config.js`, actualiza la URL:

```javascript
const ENV = {
  dev: {
    // Si pruebas en celular, usa la IP de tu computadora:
    apiUrl: 'http://192.168.0.6:3000/api',
    
    // Si pruebas en navegador web o emulador Android:
    // apiUrl: 'http://localhost:3000/api',
  },
  // ...
};
```

## 🐛 Troubleshooting

### El contenedor no inicia
```bash
# Ver errores detallados
docker-compose logs backend

# Verificar que el puerto 3000 no esté en uso
netstat -ano | findstr :3000

# Si está en uso, matar el proceso
taskkill /F /PID <PID>
```

### La base de datos no se crea
```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Recrear todo desde cero
docker-compose down -v
docker volume prune -f
docker-compose up -d
```

### Cambios en el código no se reflejan
```bash
# El código se monta como volumen, pero si cambiaste dependencias:
docker-compose build backend
docker-compose up -d
```

## 🏗️ Arquitectura

```
┌─────────────────┐         ┌──────────────────┐
│   Frontend      │────────>│    Backend       │
│  React Native   │         │   Node.js + API  │
│  (Puerto 8081)  │<────────│   (Puerto 3000)  │
└─────────────────┘         └──────────────────┘
                                     │
                                     ↓
                            ┌──────────────────┐
                            │   PostgreSQL     │
                            │   Database       │
                            │   (Puerto 5432)  │
                            └──────────────────┘
```

## 📦 Datos Incluidos

La base de datos se inicializa con:
- ✅ 3 deportes (Fútbol, Baloncesto, F1)
- ✅ 4 ligas
- ✅ 10+ equipos
- ✅ 6+ partidos próximos
- ✅ 4 usuarios de prueba
- ✅ 2 grupos de ejemplo

## 🔄 Actualizar Datos

Si modificas `init.sql` o `database_seed.sql`:

```bash
# Borrar y recrear todo
docker-compose down -v
docker-compose up -d

# Los scripts se ejecutan automáticamente
```

## 📝 Variables de Entorno

Las variables se configuran en `docker-compose.yml`. Para producción, usa un archivo `.env`:

```env
DB_PASSWORD=tu_password_seguro
JWT_SECRET=tu_secret_key_super_seguro
NODE_ENV=production
```

## ✅ Verificación Completa

```bash
# 1. Servicios corriendo
docker-compose ps

# 2. Backend responde
curl http://localhost:3000/api/health

# 3. Login funciona
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 4. Partidos disponibles
curl http://localhost:3000/api/matches/upcoming \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🚨 Importante para Producción

- [ ] Cambiar contraseñas por defecto
- [ ] Configurar HTTPS
- [ ] Usar secretos de Docker Swarm/Kubernetes
- [ ] Configurar backups de base de datos
- [ ] Limitar recursos de contenedores
- [ ] Configurar monitoreo y logs
