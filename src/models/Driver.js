const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Piloto (F1 u otras categorías de motorsport que usen predicción por posiciones).
// Puede o no tener escudería asignada. La categoría/deporte se hereda del team_id
// cuando existe; si no, se puede setear sport_id directo para pilotos independientes.
const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  short_name: {
    type: DataTypes.STRING,
    allowNull: true, // ej. "VER", "HAM"
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  number: {
    type: DataTypes.INTEGER, // dorsal
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  team_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'teams', key: 'id' },
    onDelete: 'SET NULL',
  },
  sport_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'sports', key: 'id' },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'drivers',
  indexes: [
    { fields: ['sport_id'] },
    { fields: ['team_id'] },
  ],
});

module.exports = Driver;
