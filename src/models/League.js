const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const League = sequelize.define('League', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sport_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sports',
      key: 'id'
    }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false // '2024-2025', '2024'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'leagues'
});

module.exports = League;
