const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sport = sequelize.define('Sport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // 'football', 'basketball', 'f1'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  prediction_type: {
    type: DataTypes.ENUM('score', 'positions', 'winner'),
    allowNull: false
  },
  scoring_rules: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
    // Example: { exact_score: 3, correct_winner: 1, exact_difference: 2 }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sports'
});

module.exports = Sport;
