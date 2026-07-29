const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Parrilla de pilotos que compiten en un evento concreto.
// Permite soportar wildcards, suplentes y cambios de escudería por carrera.
// Si un evento no tiene filas aquí, el frontend cae a "todos los pilotos activos
// del deporte" como parrilla por defecto.
const F1EventDriver = sequelize.define('F1EventDriver', {
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: { model: 'f1_events', key: 'id' },
    onDelete: 'CASCADE',
  },
  driver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: { model: 'drivers', key: 'id' },
    onDelete: 'CASCADE',
  },
  // Escudería del piloto en este evento (puede diferir de la del piloto en general).
  team_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'teams', key: 'id' },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'f1_event_drivers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = F1EventDriver;
