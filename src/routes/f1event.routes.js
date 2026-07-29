const express = require('express');
const router = express.Router();
const f1 = require('../controllers/f1event.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// ── Eventos F1 ────────────────────────────────────────────────────────────
router.get('/', f1.getAllEvents);
router.get('/:eventId', f1.getEventById);

router.post('/', authenticateJWT, isAdmin, f1.createEvent);
router.put('/:eventId', authenticateJWT, isAdmin, f1.updateEvent);
router.delete('/:eventId', authenticateJWT, isAdmin, f1.deleteEvent);

// Parrilla
router.get('/:eventId/drivers', f1.getEventDrivers);
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
