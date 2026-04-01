const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Group = sequelize.define('Group', {
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
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false // Invite code
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  max_members: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  }
}, {
  tableName: 'groups'
});

module.exports = Group;
