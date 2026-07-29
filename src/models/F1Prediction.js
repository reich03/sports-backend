const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Predicción del usuario para un evento F1.
// Se bloquea al llegar la hora del evento; se procesa cuando se carga el resultado.
const F1Prediction = sequelize.define('F1Prediction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'f1_events', key: 'id' },
    onDelete: 'CASCADE',
  },
  // Torneo/polla opcional al que se atribuye la predicción.
  tournament_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'tournaments', key: 'id' },
    onDelete: 'SET NULL',
  },
  // Array ordenado de driver_ids: índice 0 = P1, índice 1 = P2, etc.
  positions: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  pole_driver_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'drivers', key: 'id' },
    onDelete: 'SET NULL',
  },
  fastest_lap_driver_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'drivers', key: 'id' },
    onDelete: 'SET NULL',
  },
  driver_of_the_day_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'drivers', key: 'id' },
    onDelete: 'SET NULL',
  },
  retirements_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Desglose de puntos por categoría (para mostrar en UI).
  points_breakdown: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  is_processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'f1_predictions',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['event_id'] },
    { fields: ['tournament_id'] },
    { unique: true, fields: ['user_id', 'event_id'] }, // una predicción por usuario/evento
  ],
});

module.exports = F1Prediction;
