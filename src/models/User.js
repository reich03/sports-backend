const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Null for OAuth users
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'super_admin'),
    defaultValue: 'user'
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  auth_provider: {
    type: DataTypes.ENUM('local', 'google', 'apple'),
    defaultValue: 'local'
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  apple_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  otp_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otp_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_predictions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  correct_predictions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['google_id'] },
    { fields: ['apple_id'] }
  ]
});

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed('password') && user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    username: this.username,
    role: this.role,
    avatar: this.avatar,
    total_points: this.total_points,
    total_predictions: this.total_predictions,
    correct_predictions: this.correct_predictions
  };
};

module.exports = User;
