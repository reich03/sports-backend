# ProGana Backend API

Backend API para la aplicación de predicciones deportivas ProGana.

## Características

- Autenticación con JWT
- OAuth con Google y Apple
- Soporte multi-deporte (Fútbol, F1, Baloncesto)
- Sistema de predicciones con puntuaciones
- Rankings y grupos
- Panel de administración
- Notificaciones

## Tecnologías

- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT para autenticación
- Passport para OAuth

## Instalación

```bash
npm install
```

## Configuración

1. Copiar `.env.example` a `.env`
2. Configurar las variables de entorno
3. Crear la base de datos PostgreSQL

## Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Estructura

```
src/
  ├── config/         # Configuraciones (db, passport, etc.)
  ├── controllers/    # Controladores de rutas
  ├── models/         # Modelos de Sequelize
  ├── routes/         # Definición de rutas
  ├── middlewares/    # Middlewares personalizados
  ├── services/       # Lógica de negocio
  ├── utils/          # Utilidades
  └── server.js       # Punto de entrada
```
