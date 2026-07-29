const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Resultado oficial de un evento F1. Uno a uno con F1Event.
// El admin lo carga una vez terminada la carrera; al guardarlo se dispara
// el scoring de todas las predicciones asociadas.
const F1EventResult = sequelize.define('F1EventResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'f1_events', key: 'id' },
    onDelete: 'CASCADE',
  },
  // Array ordenado de driver_ids: posición 0 = P1, posición 1 = P2, etc.
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'f1_event_results',
});

module.exports = F1EventResult;
