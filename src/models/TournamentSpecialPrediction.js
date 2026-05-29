const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Predicciones especiales: Campeón, Subcampeón, Tercer Puesto
const TournamentSpecialPrediction = sequelize.define('TournamentSpecialPrediction', {
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
  champion_team_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'teams', key: 'id' }
  },
  runner_up_team_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'teams', key: 'id' }
  },
  third_place_team_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'teams', key: 'id' }
  },
  champion_points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  runner_up_points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  third_place_points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'tournament_special_predictions',
  indexes: [
    { fields: ['tournament_id', 'user_id'], unique: true },
    { fields: ['tournament_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = TournamentSpecialPrediction;
