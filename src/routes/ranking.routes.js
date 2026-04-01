const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/ranking.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// Ranking routes
router.get('/global', authenticateJWT, rankingController.getGlobalRanking);
router.get('/sport/:sportId', authenticateJWT, rankingController.getRankingBySport);
router.get('/league/:leagueId', authenticateJWT, rankingController.getRankingByLeague);

module.exports = router;
