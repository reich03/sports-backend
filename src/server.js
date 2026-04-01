require('dotenv').config();
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

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:19006',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

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
║   • Network:  http://192.168.0.6:${PORT}       ║
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
