const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prediction = sequelize.define('Prediction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  match_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'matches',
      key: 'id'
    }
  },
  prediction_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  prediction_data: {
    type: DataTypes.JSONB,
    allowNull: false
    // For score-based: { home_score: 2, away_score: 1 }
    // For F1: { pole_position: team_id, podium: [team_id1, team_id2, team_id3] }
  },
  points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
}, {
  tableName: 'predictions',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['match_id'] },
    { fields: ['user_id', 'match_id'], unique: true }
  ]
});

module.exports = Prediction;
