const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const F1EventParticipant = sequelize.define('F1EventParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'f1_events', key: 'id' },
    onDelete: 'CASCADE',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'f1_event_participants',
  indexes: [
    { unique: true, fields: ['event_id', 'user_id'] },
    { fields: ['event_id'] },
    { fields: ['user_id'] },
  ],
});

module.exports = F1EventParticipant;
