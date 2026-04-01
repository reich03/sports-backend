const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sport.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Public routes
router.get('/', sportController.getAllSports);
router.get('/:sportId', sportController.getSportById);

// Admin routes
router.post('/', authenticateJWT, isAdmin, sportController.createSport);
router.put('/:sportId', authenticateJWT, isAdmin, sportController.updateSport);
router.delete('/:sportId', authenticateJWT, isAdmin, sportController.deleteSport);

module.exports = router;
