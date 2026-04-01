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
