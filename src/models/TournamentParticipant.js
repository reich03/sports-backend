const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TournamentParticipant = sequelize.define('TournamentParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tournament_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tournaments', key: 'id' }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  match_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  special_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  correct_predictions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_predictions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true  // Admin puede desactivar/eliminar usuarios
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tournament_participants',
  indexes: [
    { fields: ['tournament_id'] },
    { fields: ['user_id'] },
    { fields: ['tournament_id', 'user_id'], unique: true },
    { fields: ['total_points'] }
  ]
});

module.exports = TournamentParticipant;
