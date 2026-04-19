const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Round = sequelize.define('Round', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  league_id: {
    type: DataTypes.UUID,
    allowNull: true, // Null for friendly rounds or independent tournaments
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
    // Examples: "Jornada 1", "Fecha 15", "Grupo A", "Octavos de Final", "Semifinal", "Final"
  },
  round_type: {
    type: DataTypes.ENUM(
      'regular',        // Regular league matchday
      'group_stage',    // Group phase (World Cup, Champions League)
      'round_of_32',    // Round of 32
      'round_of_16',    // Round of 16 (Octavos)
      'quarterfinal',   // Quarterfinals (Cuartos)
      'semifinal',      // Semifinals
      'final',          // Final
      'friendly'        // Friendly matches
    ),
    defaultValue: 'regular'
  },
  round_number: {
    type: DataTypes.INTEGER,
    allowNull: true
    // For ordering: Jornada 1 = 1, Jornada 2 = 2, etc.
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // Flexible field for:
    // - Group names: { group: "A", teams: [...] }
    // - Bracket positions: { bracket_position: "upper", seed: 1 }
    // - Special rules: { away_goals_rule: true, extra_time: true }
    // - Any tournament-specific data
  }
}, {
  tableName: 'rounds',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['league_id'] },
    { fields: ['sport_id'] },
    { fields: ['round_type'] },
    { fields: ['round_number'] }
  ]
});

module.exports = Round;
