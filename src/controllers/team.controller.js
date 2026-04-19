const { Team, Sport } = require('../models');

exports.getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.findAll({ 
      where: { is_active: true },
      include: [{ model: Sport, as: 'sport' }]
    });
    res.json({ data: { teams } });
  } catch (error) {
    next(error);
  }
};

exports.getTeamsBySport = async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      where: { sport_id: req.params.sportId, is_active: true }
    });
    res.json({ data: { teams } });
  } catch (error) {
    next(error);
  }
};

exports.getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.teamId, {
      include: [{ model: Sport, as: 'sport' }]
    });
    if (!team) {
      return res.status(404).json({ error: { message: 'Equipo no encontrado' } });
    }
    res.json({ data: { team } });
  } catch (error) {
    next(error);
  }
};

exports.createTeam = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({ message: 'Equipo creado', data: { team } });
  } catch (error) {
    next(error);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.teamId);
    if (!team) {
      return res.status(404).json({ error: { message: 'Equipo no encontrado' } });
    }
    await team.update(req.body);
    res.json({ message: 'Equipo actualizado', data: { team } });
  } catch (error) {
    next(error);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.teamId);
    if (!team) {
      return res.status(404).json({ error: { message: 'Equipo no encontrado' } });
    }
    await team.destroy();
    res.json({ message: 'Equipo eliminado' });
  } catch (error) {
    next(error);
  }
};

// Upload team logo
exports.uploadTeamLogo = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    
    // Verificar que el equipo existe
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ 
        error: { message: 'Equipo no encontrado' } 
      });
    }

    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ 
        error: { message: 'No se ha proporcionado ninguna imagen' } 
      });
    }

    // Eliminar logo anterior si existe
    if (team.logo && team.logo.includes('/uploads/teams/')) {
      const fs = require('fs');
      const path = require('path');
      const oldLogoPath = path.join(__dirname, '../../', team.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Actualizar URL del logo
    const logoUrl = `/uploads/teams/${req.file.filename}`;
    team.logo = logoUrl;
    await team.save();

    res.json({
      message: 'Logo actualizado exitosamente',
      data: {
        logo: logoUrl,
        team
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete team logo
exports.deleteTeamLogo = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ 
        error: { message: 'Equipo no encontrado' } 
      });
    }

    // Eliminar archivo físico si existe
    if (team.logo && team.logo.includes('/uploads/teams/')) {
      const fs = require('fs');
      const path = require('path');
      const logoPath = path.join(__dirname, '../../', team.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    // Limpiar campo en DB
    team.logo = null;
    await team.save();

    res.json({
      message: 'Logo eliminado exitosamente',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};
