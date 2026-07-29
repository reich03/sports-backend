const { Team, Sport, League } = require('../models');

// Sincroniza las ligas asociadas a un equipo (N:M).
// Acepta un array de UUIDs; si es null/undefined no toca las asociaciones.
const syncTeamLeagues = async (team, leagueIds) => {
  if (!Array.isArray(leagueIds)) return;
  await team.setLeagues(leagueIds);
};

exports.getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      where: { is_active: true },
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'leagues', through: { attributes: [] }, required: false },
      ],
    });
    res.json({ data: { teams } });
  } catch (error) {
    next(error);
  }
};

exports.getTeamsBySport = async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      where: { sport_id: req.params.sportId, is_active: true },
      include: [
        { model: League, as: 'leagues', through: { attributes: [] }, required: false },
      ],
    });
    res.json({ data: { teams } });
  } catch (error) {
    next(error);
  }
};

// Equipos asociados a una liga (N:M).
// Fallback: si la liga aún no tiene equipos asociados, devuelve todos los del deporte
// de esa liga para no romper la UX actual mientras el admin va etiquetando equipos.
exports.getTeamsByLeague = async (req, res, next) => {
  try {
    const { leagueId } = req.params;

    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ error: { message: 'Liga no encontrada' } });
    }

    const associatedTeams = await Team.findAll({
      where: { is_active: true },
      include: [
        { model: League, as: 'leagues', where: { id: leagueId }, through: { attributes: [] }, required: true },
        { model: Sport, as: 'sport' },
      ],
    });

    if (associatedTeams.length > 0) {
      return res.json({ data: { teams: associatedTeams, fallback: false } });
    }

    // Fallback: equipos del mismo deporte que la liga
    const fallbackTeams = await Team.findAll({
      where: { sport_id: league.sport_id, is_active: true },
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'leagues', through: { attributes: [] }, required: false },
      ],
    });

    res.json({ data: { teams: fallbackTeams, fallback: true } });
  } catch (error) {
    next(error);
  }
};

exports.getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.teamId, {
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'leagues', through: { attributes: [] }, required: false },
      ],
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
    const { league_ids, ...teamData } = req.body;
    const team = await Team.create(teamData);
    await syncTeamLeagues(team, league_ids);
    const fresh = await Team.findByPk(team.id, {
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'leagues', through: { attributes: [] }, required: false },
      ],
    });
    res.status(201).json({ message: 'Equipo creado', data: { team: fresh } });
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
    const { league_ids, ...teamData } = req.body;
    await team.update(teamData);
    await syncTeamLeagues(team, league_ids);
    const fresh = await Team.findByPk(team.id, {
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'leagues', through: { attributes: [] }, required: false },
      ],
    });
    res.json({ message: 'Equipo actualizado', data: { team: fresh } });
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
