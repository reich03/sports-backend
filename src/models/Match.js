const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  league_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'leagues',
      key: 'id'
    }
  },
  sport_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sports',
      key: 'id'
    }
  },
  home_team_id: {
    type: DataTypes.UUID,
    allowNull: true, // Null for F1 races
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  away_team_id: {
    type: DataTypes.UUID,
    allowNull: true, // Null for F1 races
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  match_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  round: {
    type: DataTypes.STRING,
    allowNull: true // 'Jornada 15', 'Race 5'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'finished', 'cancelled', 'postponed'),
    defaultValue: 'scheduled'
  },
  home_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  away_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  result_data: {
    type: DataTypes.JSON,
    allowNull: true
    // For F1: { pole_position: team_id, positions: [team_id1, team_id2, ...] }
    // For football: { home_score: 2, away_score: 1 }
  },
  predictions_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lock_date: {
    type: DataTypes.DATE,
    allowNull: true // When predictions should be locked (usually before match_date)
  }
}, {
  tableName: 'matches',
  indexes: [
    { fields: ['match_date'] },
    { fields: ['status'] },
    { fields: ['league_id'] }
  ]
});

module.exports = Match;
