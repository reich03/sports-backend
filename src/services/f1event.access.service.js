const { Op } = require('sequelize');
const { F1Event, F1EventParticipant, Driver } = require('../models');
const { generateGroupCode } = require('../utils/generators.util');

const isAdminUser = (user) => user && ['admin', 'super_admin'].includes(user.role);

async function getEventGridDriverIds(eventId) {
  const event = await F1Event.findByPk(eventId);
  if (!event) return { event: null, driverIds: [], fallback: false };

  const grid = await event.getDrivers({ attributes: ['id'] });
  if (grid.length > 0) {
    return { event, driverIds: grid.map((d) => d.id), fallback: false };
  }

  const fallback = await Driver.findAll({
    where: { sport_id: event.sport_id, is_active: true },
    attributes: ['id'],
    order: [['number', 'ASC']],
  });
  return { event, driverIds: fallback.map((d) => d.id), fallback: true };
}

function validatePredictionGrid({
  positions,
  poleDriverId,
  fastestLapDriverId,
  driverOfTheDayId,
  allowedDriverIds,
  gridSize,
}) {
  const allowed = new Set(allowedDriverIds);
  const errors = [];

  const list = Array.isArray(positions) ? positions : [];
  const filled = list.filter(Boolean);

  if (filled.length === 0) {
    errors.push('Debes asignar al menos un piloto en la parrilla');
  }

  if (filled.length > gridSize) {
    errors.push(`La parrilla admite máximo ${gridSize} posiciones`);
  }

  const seen = new Set();
  filled.forEach((driverId, idx) => {
    if (!allowed.has(driverId)) {
      errors.push(`El piloto en P${idx + 1} no está en la parrilla oficial del evento`);
    }
    if (seen.has(driverId)) {
      errors.push('No puedes repetir el mismo piloto en varias posiciones');
    }
    seen.add(driverId);
  });

  [poleDriverId, fastestLapDriverId, driverOfTheDayId].forEach((driverId, i) => {
    if (!driverId) return;
    if (!allowed.has(driverId)) {
      const labels = ['pole position', 'vuelta rápida', 'piloto del día'];
      errors.push(`El piloto de ${labels[i]} no está en la parrilla del evento`);
    }
  });

  return errors;
}

async function isUserJoined(eventId, userId) {
  if (!userId) return false;
  const row = await F1EventParticipant.findOne({
    where: { event_id: eventId, user_id: userId, is_active: true },
  });
  return !!row;
}

async function userCanAccessEvent(event, user) {
  if (!event) return false;
  if (event.type !== 'private') return true;
  if (isAdminUser(user)) return true;
  if (!user) return false;
  return isUserJoined(event.id, user.id);
}

async function joinEvent(userId, eventId, accessCode = null) {
  const event = await F1Event.findByPk(eventId);
  if (!event) throw new Error('Evento no encontrado');
  if (event.status === 'finished') throw new Error('Este evento ya finalizó');

  if (event.type === 'private') {
    if (!accessCode || accessCode.toUpperCase() !== event.access_code?.toUpperCase()) {
      throw new Error('Código de acceso inválido');
    }
  }

  if (event.max_participants) {
    const count = await F1EventParticipant.count({
      where: { event_id: eventId, is_active: true },
    });
    if (count >= event.max_participants) throw new Error('El evento está lleno');
  }

  const [participant, created] = await F1EventParticipant.findOrCreate({
    where: { event_id: eventId, user_id: userId },
    defaults: { event_id: eventId, user_id: userId },
  });

  if (!created && !participant.is_active) {
    await participant.update({ is_active: true });
    return { participant, rejoined: true };
  }

  return { participant, created };
}

async function joinByCode(userId, accessCode) {
  const event = await F1Event.findOne({
    where: { access_code: accessCode.toUpperCase(), type: 'private' },
  });
  if (!event) throw new Error('Código de acceso inválido o evento no encontrado');
  return joinEvent(userId, event.id, accessCode);
}

function normalizeAccessCode(code) {
  return code ? String(code).trim().toUpperCase().slice(0, 10) : null;
}

function ensurePrivateEventCode(eventData) {
  const data = { ...eventData };
  if (data.type === 'private') {
    if (!data.access_code) {
      data.access_code = generateGroupCode().slice(0, 8);
    } else {
      data.access_code = normalizeAccessCode(data.access_code);
    }
  } else {
    data.access_code = null;
  }
  return data;
}

module.exports = {
  getEventGridDriverIds,
  validatePredictionGrid,
  isUserJoined,
  userCanAccessEvent,
  joinEvent,
  joinByCode,
  ensurePrivateEventCode,
  isAdminUser,
};
