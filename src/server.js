require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// Import configurations
const sequelize = require('./config/database');
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const sportRoutes = require('./routes/sport.routes');
const leagueRoutes = require('./routes/league.routes');
const teamRoutes = require('./routes/team.routes');
const matchRoutes = require('./routes/match.routes');
const predictionRoutes = require('./routes/prediction.routes');
const groupRoutes = require('./routes/group.routes');
const rankingRoutes = require('./routes/ranking.routes');
const notificationRoutes = require('./routes/notification.routes');
const roundRoutes = require('./routes/round.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const driverRoutes = require('./routes/driver.routes');
const f1EventRoutes = require('./routes/f1event.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:19006',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Aumentar límite para requests JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Aumentar límite para URL encoded
app.use(cookieParser());
app.use(passport.initialize());

// Servir archivos estáticos (avatares de usuarios)
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/f1-events', f1EventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Master Sport API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Legacy health check (sin /api prefix)
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Database sync and server start
const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Verificar si las tablas ya existen (creadas por init.sql)
    const tables = await sequelize.getQueryInterface().showAllTables();
    
    if (tables.length === 0) {
      console.log('📝 No tables found. Running sync...');
      await sequelize.sync();
      console.log('✅ Database synchronized.');
    } else {
      console.log(`✅ Database already initialized (${tables.length} tables found).`);

      // Auto-migración segura: crear tablas nuevas si no existen, sin tocar las viejas.
      // Añadir aquí cualquier tabla nueva que se agregue en el tiempo.
      const {
        TeamLeague,
        Driver,
        F1Event,
        F1EventDriver,
        F1EventResult,
        F1Prediction,
        F1EventParticipant,
      } = require('./models');

      const tableName = (t) => (typeof t === 'string' ? t : t.tableName);
      const has = (name) => tables.some((t) => tableName(t) === name);

      // Definir aquí las tablas nuevas en el orden de dependencia (padres antes que hijas).
      const newTables = [
        { name: 'team_leagues', model: TeamLeague },
        { name: 'drivers', model: Driver },
        { name: 'f1_events', model: F1Event },
        { name: 'f1_event_drivers', model: F1EventDriver },
        { name: 'f1_event_results', model: F1EventResult },
        { name: 'f1_predictions', model: F1Prediction },
        { name: 'f1_event_participants', model: F1EventParticipant },
      ];

      for (const t of newTables) {
        if (!has(t.name)) {
          console.log(`📝 Creando tabla nueva: ${t.name}`);
          // eslint-disable-next-line no-await-in-loop
          await t.model.sync();
          console.log(`✅ Tabla ${t.name} creada.`);
        }
      }

      // Columna nueva en f1_events: cierre independiente de pole position
      if (has('f1_events')) {
        try {
          const qi = sequelize.getQueryInterface();
          const f1Cols = await qi.describeTable('f1_events');
          const { DataTypes } = require('sequelize');
          if (f1Cols && !f1Cols.pole_lock_date) {
            await qi.addColumn('f1_events', 'pole_lock_date', {
              type: DataTypes.DATE,
              allowNull: true,
            });
            console.log('✅ Columna pole_lock_date añadida a f1_events.');
          }
          if (f1Cols && !f1Cols.type) {
            await qi.addColumn('f1_events', 'type', {
              type: DataTypes.STRING,
              allowNull: false,
              defaultValue: 'public',
            });
            console.log('✅ Columna type añadida a f1_events.');
          }
          if (f1Cols && !f1Cols.access_code) {
            await qi.addColumn('f1_events', 'access_code', {
              type: DataTypes.STRING(10),
              allowNull: true,
              unique: true,
            });
            console.log('✅ Columna access_code añadida a f1_events.');
          }
          if (f1Cols && !f1Cols.max_participants) {
            await qi.addColumn('f1_events', 'max_participants', {
              type: DataTypes.INTEGER,
              allowNull: true,
            });
            console.log('✅ Columna max_participants añadida a f1_events.');
          }
        } catch (colErr) {
          console.warn('⚠️  No se pudo verificar columnas F1:', colErr.message);
        }
      }

      // Seed: asegurar el deporte "Formula 1" para reutilizar el sistema de equipos/ligas.
      try {
        const { Sport } = require('./models');
        const existing = await Sport.findOne({ where: { code: 'f1' } });
        if (!existing) {
          await Sport.create({
            name: 'Formula 1',
            code: 'f1',
            icon: 'car-sport',
            prediction_type: 'positions',
            scoring_rules: {
              exact_position: 5,
              top10_hit: 8,
              podium_hit: 7,
            },
            is_active: true,
            order: 10,
          });
          console.log('✅ Deporte "Formula 1" creado.');
        }
      } catch (seedErr) {
        console.warn('⚠️  No se pudo asegurar el deporte F1:', seedErr.message);
      }
    }

    app.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║   🚀 MASTER SPORT API SERVER                  ║
╠════════════════════════════════════════════════╣
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)} ║
║   Port:        ${String(PORT).padEnd(28)} ║
║   Host:        ${String(HOST).padEnd(28)} ║
║                                                ║
║   📡 Endpoints:                                ║
║   • GET  /api/health                          ║
║   • POST /api/auth/login                      ║
║   • POST /api/auth/register                   ║
║   • GET  /api/sports                          ║
║   • GET  /api/matches/upcoming                ║
║                                                ║
║   🌐 Access URLs:                              ║
║   • Local:    http://localhost:${PORT}         ║
║   • Network:  http://192.168.1.10:${PORT}       ║
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();

module.exports = app;
