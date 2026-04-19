const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/ranking.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// Ranking routes
router.get('/global', authenticateJWT, rankingController.getGlobalRanking);
router.get('/sport', authenticateJWT, rankingController.getRankingBySport);
router.get('/league', authenticateJWT, rankingController.getRankingByLeague);
router.get('/round', authenticateJWT, rankingController.getRankingByRound);

module.exports = router;
