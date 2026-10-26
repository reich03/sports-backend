const express = require('express');
const router = express.Router();
const f1 = require('../controllers/f1event.controller');
const { authenticateJWT, optionalAuth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// ── Eventos F1 ────────────────────────────────────────────────────────────
router.get('/', optionalAuth, f1.getAllEvents);
router.post('/join-by-code', authenticateJWT, f1.joinByCode);
router.get('/:eventId', optionalAuth, f1.getEventById);

router.post('/', authenticateJWT, isAdmin, f1.createEvent);
router.put('/:eventId', authenticateJWT, isAdmin, f1.updateEvent);
router.delete('/:eventId', authenticateJWT, isAdmin, f1.deleteEvent);

router.post('/:eventId/join', authenticateJWT, f1.joinEvent);

// Parrilla
router.get('/:eventId/drivers', optionalAuth, f1.getEventDrivers);
router.put('/:eventId/drivers', authenticateJWT, isAdmin, f1.setEventDrivers);

// Resultado oficial (admin)
router.get('/:eventId/result', f1.getEventResult);
router.put('/:eventId/result', authenticateJWT, isAdmin, f1.upsertEventResult);

// Predicciones (usuario)
router.get('/:eventId/my-prediction', authenticateJWT, f1.getMyPrediction);
router.put('/:eventId/my-prediction', authenticateJWT, f1.upsertMyPrediction);

// Ranking del evento
router.get('/:eventId/leaderboard', f1.getEventLeaderboard);

module.exports = router;
