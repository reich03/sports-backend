const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabla intermedia N:M entre Team y League.
// Permite que un equipo pertenezca a varias ligas (ej: selección nacional
// juega Mundial, Copa Oro, Copa América, etc.).
// Asociación opcional: equipos sin filas aquí siguen apareciendo por fallback de deporte.
const TeamLeague = sequelize.define('TeamLeague', {
  team_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: { model: 'teams', key: 'id' },
    onDelete: 'CASCADE',
  },
  league_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: { model: 'leagues', key: 'id' },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'team_leagues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = TeamLeague;
