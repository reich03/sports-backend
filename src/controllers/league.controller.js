const { League, Sport } = require('../models');

exports.getAllLeagues = async (req, res, next) => {
  try {
    const leagues = await League.findAll({ 
      where: { is_active: true },
      include: [{ model: Sport, as: 'sport' }]
    });
    res.json({ data: { leagues } });
  } catch (error) {
    next(error);
  }
};

exports.getLeaguesBySport = async (req, res, next) => {
  try {
    const leagues = await League.findAll({
      where: { sport_id: req.params.sportId, is_active: true },
      include: [{ model: Sport, as: 'sport' }]
    });
    res.json({ data: { leagues } });
  } catch (error) {
    next(error);
  }
};

exports.getLeagueById = async (req, res, next) => {
  try {
    const league = await League.findByPk(req.params.leagueId, {
      include: [{ model: Sport, as: 'sport' }]
    });
    if (!league) {
      return res.status(404).json({ error: { message: 'Liga no encontrada' } });
    }
    res.json({ data: { league } });
  } catch (error) {
    next(error);
  }
};

exports.createLeague = async (req, res, next) => {
  try {
    const league = await League.create(req.body);
    res.status(201).json({ message: 'Liga creada', data: { league } });
  } catch (error) {
    next(error);
  }
};

exports.updateLeague = async (req, res, next) => {
  try {
    const league = await League.findByPk(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ error: { message: 'Liga no encontrada' } });
    }
    await league.update(req.body);
    res.json({ message: 'Liga actualizada', data: { league } });
  } catch (error) {
    next(error);
  }
};

exports.deleteLeague = async (req, res, next) => {
  try {
    const league = await League.findByPk(req.params.leagueId);
    if (!league) {
      return res.status(404).json({ error: { message: 'Liga no encontrada' } });
    }
    await league.destroy();
    res.json({ message: 'Liga eliminada' });
  } catch (error) {
    next(error);
  }
};
