const { Driver, Team, Sport } = require('../models');

const DRIVER_INCLUDE = [
  { model: Sport, as: 'sport' },
  { model: Team, as: 'team' },
];

exports.getAllDrivers = async (req, res, next) => {
  try {
    const where = { is_active: true };
    if (req.query.sport_id) where.sport_id = req.query.sport_id;
    if (req.query.team_id) where.team_id = req.query.team_id;
    const drivers = await Driver.findAll({ where, include: DRIVER_INCLUDE, order: [['number', 'ASC'], ['name', 'ASC']] });
    res.json({ data: { drivers } });
  } catch (error) {
    next(error);
  }
};

exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.driverId, { include: DRIVER_INCLUDE });
    if (!driver) return res.status(404).json({ error: { message: 'Piloto no encontrado' } });
    res.json({ data: { driver } });
  } catch (error) {
    next(error);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const { name, short_name, nationality, number, team_id, sport_id } = req.body;
    if (!name || !sport_id) {
      return res.status(400).json({ error: { message: 'name y sport_id son obligatorios' } });
    }
    const driver = await Driver.create({ name, short_name, nationality, number, team_id: team_id || null, sport_id });
    const fresh = await Driver.findByPk(driver.id, { include: DRIVER_INCLUDE });
    res.status(201).json({ message: 'Piloto creado', data: { driver: fresh } });
  } catch (error) {
    next(error);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.driverId);
    if (!driver) return res.status(404).json({ error: { message: 'Piloto no encontrado' } });
    await driver.update(req.body);
    const fresh = await Driver.findByPk(driver.id, { include: DRIVER_INCLUDE });
    res.json({ message: 'Piloto actualizado', data: { driver: fresh } });
  } catch (error) {
    next(error);
  }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.driverId);
    if (!driver) return res.status(404).json({ error: { message: 'Piloto no encontrado' } });
    await driver.destroy();
    res.json({ message: 'Piloto eliminado' });
  } catch (error) {
    next(error);
  }
};

exports.uploadDriverPhoto = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findByPk(driverId);
    if (!driver) return res.status(404).json({ error: { message: 'Piloto no encontrado' } });
    if (!req.file) return res.status(400).json({ error: { message: 'No se ha proporcionado imagen' } });

    if (driver.photo && driver.photo.includes('/uploads/drivers/')) {
      const fs = require('fs');
      const path = require('path');
      const oldPath = path.join(__dirname, '../../', driver.photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const url = `/uploads/drivers/${req.file.filename}`;
    driver.photo = url;
    await driver.save();
    res.json({ message: 'Foto actualizada', data: { photo: url, driver } });
  } catch (error) {
    next(error);
  }
};

exports.deleteDriverPhoto = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findByPk(driverId);
    if (!driver) return res.status(404).json({ error: { message: 'Piloto no encontrado' } });
    if (driver.photo && driver.photo.includes('/uploads/drivers/')) {
      const fs = require('fs');
      const path = require('path');
      const p = path.join(__dirname, '../../', driver.photo);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    driver.photo = null;
    await driver.save();
    res.json({ message: 'Foto eliminada', data: { driver } });
  } catch (error) {
    next(error);
  }
};
