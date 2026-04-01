const { Sport } = require('../models');

exports.getAllSports = async (req, res, next) => {
  try {
    const sports = await Sport.findAll({ 
      where: { is_active: true },
      order: [['order', 'ASC']]
    });
    res.json({ data: { sports } });
  } catch (error) {
    next(error);
  }
};

exports.getSportById = async (req, res, next) => {
  try {
    const sport = await Sport.findByPk(req.params.sportId);
    if (!sport) {
      return res.status(404).json({ error: { message: 'Deporte no encontrado' } });
    }
    res.json({ data: { sport } });
  } catch (error) {
    next(error);
  }
};

exports.createSport = async (req, res, next) => {
  try {
    const sport = await Sport.create(req.body);
    res.status(201).json({ message: 'Deporte creado', data: { sport } });
  } catch (error) {
    next(error);
  }
};

exports.updateSport = async (req, res, next) => {
  try {
    const sport = await Sport.findByPk(req.params.sportId);
    if (!sport) {
      return res.status(404).json({ error: { message: 'Deporte no encontrado' } });
    }
    await sport.update(req.body);
    res.json({ message: 'Deporte actualizado', data: { sport } });
  } catch (error) {
    next(error);
  }
};

exports.deleteSport = async (req, res, next) => {
  try {
    const sport = await Sport.findByPk(req.params.sportId);
    if (!sport) {
      return res.status(404).json({ error: { message: 'Deporte no encontrado' } });
    }
    await sport.destroy();
    res.json({ message: 'Deporte eliminado' });
  } catch (error) {
    next(error);
  }
};
