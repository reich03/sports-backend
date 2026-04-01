const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { authenticateJWT, optionalAuth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Public routes
router.get('/', optionalAuth, matchController.getMatches);
router.get('/upcoming', optionalAuth, matchController.getUpcomingMatches);
router.get('/:matchId', optionalAuth, matchController.getMatchById);

// Admin routes
router.post('/', authenticateJWT, isAdmin, matchController.createMatch);
router.put('/:matchId', authenticateJWT, isAdmin, matchController.updateMatch);
router.delete('/:matchId', authenticateJWT, isAdmin, matchController.deleteMatch);
router.post('/:matchId/result', authenticateJWT, isAdmin, matchController.submitMatchResult);

module.exports = router;
