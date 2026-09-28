const {
  F1Event,
  F1EventDriver,
  F1EventResult,
  F1Prediction,
  Driver,
  Team,
  Sport,
  League,
  Tournament,
  User,
  sequelize,
} = require('../models');
const { scorePrediction } = require('../services/f1Scoring.service');

const EVENT_BASE_INCLUDE = [
  { model: Sport, as: 'sport' },
  { model: League, as: 'league' },
  { model: Tournament, as: 'tournament' },
];

// ── EVENTOS ────────────────────────────────────────────────────────────────

exports.getAllEvents = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.season) where.season = req.query.season;
    if (req.query.sport_id) where.sport_id = req.query.sport_id;
    if (req.query.league_id) where.league_id = req.query.league_id;
    if (req.query.tournament_id) where.tournament_id = req.query.tournament_id;
    if (req.query.status) where.status = req.query.status;

    const events = await F1Event.findAll({
      where,
      include: EVENT_BASE_INCLUDE,
      order: [['event_date', 'ASC']],
    });
    res.json({ data: { events } });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await F1Event.findByPk(req.params.eventId, {
      include: [
        ...EVENT_BASE_INCLUDE,
        {
          model: Driver,
          as: 'drivers',
          through: { attributes: ['team_id'] },
          include: [{ model: Team, as: 'team' }],
        },
        {
          model: F1EventResult,
          as: 'result',
          include: [
            { model: Driver, as: 'pole_driver' },
            { model: Driver, as: 'fastest_lap_driver' },
            { model: Driver, as: 'driver_of_the_day' },
          ],
        },
      ],
    });
    if (!event) return res.status(404).json({ error: { message: 'Evento no encontrado' } });
    res.json({ data: { event } });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { drivers_ids, ...eventData } = req.body;
    if (!eventData.name || !eventData.event_date || !eventData.season || !eventData.sport_id) {
      return res.status(400).json({ error: { message: 'name, season, event_date y sport_id son obligatorios' } });
    }
    const event = await F1Event.create(eventData);
    if (Array.isArray(drivers_ids) && drivers_ids.length > 0) {
      await event.setDrivers(drivers_ids);
    }
    const fresh = await F1Event.findByPk(event.id, {
      include: [...EVENT_BASE_INCLUDE, { model: Driver, as: 'drivers', through: { attributes: [] } }],
    });
    res.status(201).json({ message: 'Evento creado', data: { event: fresh } });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await F1Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: { message: 'Evento no encontrado' } });
    const { drivers_ids, ...eventData } = req.body;
    await event.update(eventData);
    if (Array.isArray(drivers_ids)) {
      await event.setDrivers(drivers_ids);
    }
    const fresh = await F1Event.findByPk(event.id, {
      include: [...EVENT_BASE_INCLUDE, { model: Driver, as: 'drivers', through: { attributes: [] } }],
    });
    res.json({ message: 'Evento actualizado', data: { event: fresh } });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await F1Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: { message: 'Evento no encontrado' } });
    await event.destroy();
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    next(error);
  }
};

// ── PARRILLA (drivers de un evento) ────────────────────────────────────────

// Devuelve la parrilla del evento. Si no hay parrilla explícita, cae a todos los
// pilotos activos del deporte del evento.
exports.getEventDrivers = async (req, res, next) => {
  try {
    const event = await F1Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: { message: 'Evento no encontrado' } });

    const grid = await event.getDrivers({
      include: [{ model: Team, as: 'team' }],
      through: { attributes: ['team_id'] },
      order: [['number', 'ASC']],
    });

    if (grid.length > 0) {
      return res.json({ data: { drivers: grid, fallback: false } });
    }

    const fallback = await Driver.findAll({
      where: { sport_id: event.sport_id, is_active: true },
      include: [{ model: Team, as: 'team' }],
      order: [['number', 'ASC']],
    });
    res.json({ data: { drivers: fallback, fallback: true } });
  } catch (error) {
    next(error);
  }
};

exports.setEventDrivers = async (req, res, next) => {
  try {
    const event = await F1Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: { message: 'Evento no encontrado' } });
    const { drivers_ids } = req.body;
    if (!Array.isArray(drivers_ids)) {
      return res.status(400).json({ error: { message: 'drivers_ids debe ser un array' } });
    }
    await event.setDrivers(drivers_ids);
    res.json({ message: 'Parrilla actualizada' });
  } catch (error) {
    next(error);
  }
};

// ── RESULTADO OFICIAL + PROCESAMIENTO ──────────────────────────────────────

// Cargar (o actualizar) el resultado del evento. Al guardarlo:
// - marca el evento como finished
// - recalcula puntos de todas las predicciones del evento
exports.upsertEventResult = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const event = await F1Event.findByPk(req.params.eventId, { transaction: t });
    if (!event) {
      await t.rollback();
      return res.status(404).json({ error: { message: 'Evento no encontrado' } });
    }

    const payload = {
      event_id: event.id,
      positions: Array.isArray(req.body.positions) ? req.body.positions : [],
      pole_driver_id: req.body.pole_driver_id || null,
      fastest_lap_driver_id: req.body.fastest_lap_driver_id || null,
      driver_of_the_day_id: req.body.driver_of_the_day_id || null,
      retirements_count:
        typeof req.body.retirements_count === 'number' ? req.body.retirements_count : null,
      notes: req.body.notes || null,
    };

    let result = await F1EventResult.findOne({ where: { event_id: event.id }, transaction: t });
    if (result) {
      await result.update(payload, { transaction: t });
    } else {
      result = await F1EventResult.create(payload, { transaction: t });
    }

    // Procesar predicciones
    const predictions = await F1Prediction.findAll({ where: { event_id: event.id }, transaction: t });
    for (const pred of predictions) {
      const { total, breakdown } = scorePrediction(
        {
          positions: pred.positions,
          pole_driver_id: pred.pole_driver_id,
          fastest_lap_driver_id: pred.fastest_lap_driver_id,
          driver_of_the_day_id: pred.driver_of_the_day_id,
          retirements_count: pred.retirements_count,
        },
        result,
        event.points_config,
      );
      // eslint-disable-next-line no-await-in-loop
      await pred.update(
        { points_earned: total, points_breakdown: breakdown, is_processed: true, processed_at: new Date() },
        { transaction: t },
      );
    }

    await result.update({ processed_at: new Date() }, { transaction: t });
    await event.update({ status: 'finished' }, { transaction: t });

    await t.commit();
    res.json({ message: 'Resultado guardado y predicciones procesadas', data: { result, processed_count: predictions.length } });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.getEventResult = async (req, res, next) => {
  try {
    const result = await F1EventResult.findOne({
      where: { event_id: req.params.eventId },
      include: [
        { model: Driver, as: 'pole_driver' },
        { model: Driver, as: 'fastest_lap_driver' },
        { model: Driver, as: 'driver_of_the_day' },
      ],
    });
    if (!result) return res.status(404).json({ error: { message: 'Resultado no cargado aún' } });
    res.json({ data: { result } });
  } catch (error) {
    next(error);
  }
};

// ── PREDICCIONES ───────────────────────────────────────────────────────────

const isMatchTimeReached = (dateVal) => Date.now() >= new Date(dateVal).getTime();

const isRaceLocked = (event) =>
  !event || isMatchTimeReached(event.event_date) || event.status !== 'scheduled';

const isPoleLocked = (event) => {
  if (!event) return true;
  if (event.status !== 'scheduled') return true;
  const lockDate = event.pole_lock_date || event.event_date;
  return isMatchTimeReached(lockDate);
};

exports.getMyPrediction = async (req, res, next) => {
  try {
    const prediction = await F1Prediction.findOne({
      where: { user_id: req.user.id, event_id: req.params.eventId },
    });
    res.json({ data: { prediction } });
  } catch (error) {
    next(error);
  }
};

exports.upsertMyPrediction = async (req, res, next) => {
  try {
    const event = await F1Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ error: { message: 'Evento no encontrado' } });

    const raceLocked = isRaceLocked(event);
    const poleLocked = isPoleLocked(event);

    if (raceLocked) {
      return res.status(400).json({ error: { message: 'Las predicciones para este evento ya están cerradas' } });
    }

    const existing = await F1Prediction.findOne({
      where: { user_id: req.user.id, event_id: event.id },
    });

    const requestedPole = req.body.pole_driver_id || null;
    if (poleLocked && requestedPole && existing?.pole_driver_id && requestedPole !== existing.pole_driver_id) {
      return res.status(400).json({
        error: { message: 'La predicción de pole position ya está cerrada (clasificación)' },
      });
    }
    if (poleLocked && requestedPole && !existing?.pole_driver_id) {
      return res.status(400).json({
        error: { message: 'El plazo para elegir pole position ya cerró. No se pudo guardar.' },
      });
    }

    const payload = {
      user_id: req.user.id,
      event_id: event.id,
      tournament_id: req.body.tournament_id || event.tournament_id || null,
      positions: Array.isArray(req.body.positions)
        ? req.body.positions
        : (existing?.positions || []),
      pole_driver_id: poleLocked
        ? (existing?.pole_driver_id ?? null)
        : requestedPole,
      fastest_lap_driver_id: req.body.fastest_lap_driver_id ?? existing?.fastest_lap_driver_id ?? null,
      driver_of_the_day_id: req.body.driver_of_the_day_id ?? existing?.driver_of_the_day_id ?? null,
      retirements_count:
        typeof req.body.retirements_count === 'number'
          ? req.body.retirements_count
          : (existing?.retirements_count ?? null),
    };

    let prediction = existing;
    if (prediction) {
      await prediction.update(payload);
    } else {
      prediction = await F1Prediction.create(payload);
    }

    res.json({
      message: 'Predicción guardada',
      data: {
        prediction,
        locks: { pole_locked: poleLocked, race_locked: raceLocked },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Ranking / clasificación del evento (todas las predicciones, ordenadas por puntos).
exports.getEventLeaderboard = async (req, res, next) => {
  try {
    const predictions = await F1Prediction.findAll({
      where: { event_id: req.params.eventId },
      attributes: [
        'id', 'user_id', 'event_id', 'points_earned', 'points_breakdown',
        'is_processed', 'created_at',
      ],
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
      order: [['points_earned', 'DESC'], ['created_at', 'ASC']],
    });
    res.json({ data: { leaderboard: predictions } });
  } catch (error) {
    next(error);
  }
};
