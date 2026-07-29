const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Gran Premio (o carrera individual). Un evento pertenece opcionalmente a una liga
// (temporada) y a un torneo/polla. La predicción y el resultado son por evento.
const F1Event = sequelize.define('F1Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // ej. "Gran Premio de Mónaco"
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false, // ej. "2026"
  },
  circuit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  event_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'finished', 'cancelled'),
    defaultValue: 'scheduled',
  },
  sport_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'sports', key: 'id' },
  },
  league_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'leagues', key: 'id' },
    onDelete: 'SET NULL',
  },
  // Torneo/polla al que pertenece el evento (opcional).
  tournament_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'tournaments', key: 'id' },
    onDelete: 'SET NULL',
  },
  grid_size: {
    type: DataTypes.INTEGER,
    defaultValue: 20, // F1 real; configurable 10..26
  },
  // Reglas de puntos configurables por evento.
  points_config: {
    type: DataTypes.JSONB,
    defaultValue: {
      exact_position: 5,   // acertar posición exacta 1..N
      top10_hit: 8,         // piloto queda en top 10 (aunque no acierte posición)
      podium_hit: 7,        // piloto queda en top 3 (aunque no acierte posición)
      pole: 5,
      fastest_lap: 5,
      driver_of_the_day: 5,
      retirements_exact: 10,
      retirements_close: 5, // ±1
    },
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'f1_events',
  indexes: [
    { fields: ['sport_id'] },
    { fields: ['league_id'] },
    { fields: ['tournament_id'] },
    { fields: ['status'] },
    { fields: ['event_date'] },
  ],
});

module.exports = F1Event;
