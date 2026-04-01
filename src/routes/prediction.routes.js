const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// User predictions
router.post('/', authenticateJWT, predictionController.createPrediction);
router.get('/my-predictions', authenticateJWT, predictionController.getMyPredictions);
router.get('/match/:matchId', authenticateJWT, predictionController.getPredictionsByMatch);
router.put('/:predictionId', authenticateJWT, predictionController.updatePrediction);

module.exports = router;
