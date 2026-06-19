const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  league_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'leagues', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public'
  },
  access_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'finished'),
    defaultValue: 'upcoming'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Puntuación para predicciones especiales (menciones)
  champion_points: {
    type: DataTypes.INTEGER,
    defaultValue: 45
  },
  runner_up_points: {
    type: DataTypes.INTEGER,
    defaultValue: 35
  },
  third_place_points: {
    type: DataTypes.INTEGER,
    defaultValue: 25
  },
  // Reglas de puntos para partidos (MASTERSPORTS)
  scoring_rules: {
    type: DataTypes.JSONB,
    defaultValue: {
      exact_score: 10,
      correct_winner: 5,
      correct_draw: 5,
      home_goal_bonus: 2,
      away_goal_bonus: 2
    }
  },
  // Menciones especiales (campeón, sub, tercero) — admin puede desactivar
  special_predictions_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Bloquear menciones especiales cuando empieza el torneo
  special_predictions_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: true // null = sin límite
  }
}, {
  tableName: 'tournaments',
  indexes: [
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['access_code'] }
  ]
});

module.exports = Tournament;
