const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeagueStanding = sequelize.define('LeagueStanding', {
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
  team_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  round_id: {
    type: DataTypes.UUID,
    allowNull: true, // Null for overall standings
    references: {
      model: 'rounds',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  played: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  won: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  drawn: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lost: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  goals_for: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  goals_against: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  goal_difference: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  form: {
    type: DataTypes.STRING(20),
    allowNull: true
    // Last 5 games: "WWDLW"
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
    // Additional stats: { shots: 150, corners: 45, cards: { yellow: 20, red: 2 } }
  }
}, {
  tableName: 'league_standings',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['league_id'] },
    { fields: ['team_id'] },
    { fields: ['round_id'] },
    { fields: ['league_id', 'position'] },
    { fields: ['league_id', 'team_id', 'round_id'], unique: true }
  ]
});

module.exports = LeagueStanding;
