const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/league.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Public routes
router.get('/', leagueController.getAllLeagues);
router.get('/:leagueId', leagueController.getLeagueById);
router.get('/sport/:sportId', leagueController.getLeaguesBySport);

// Admin routes
router.post('/', authenticateJWT, isAdmin, leagueController.createLeague);
router.put('/:leagueId', authenticateJWT, isAdmin, leagueController.updateLeague);
router.delete('/:leagueId', authenticateJWT, isAdmin, leagueController.deleteLeague);

module.exports = router;
