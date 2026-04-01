const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isOwnerOrAdmin } = require('../middlewares/role.middleware');

// Get user profile
router.get('/:userId', authenticateJWT, userController.getUserProfile);

// Update user profile
router.put('/:userId', authenticateJWT, isOwnerOrAdmin(), userController.updateUserProfile);

// Get user predictions history
router.get('/:userId/predictions', authenticateJWT, userController.getUserPredictions);

// Get user statistics
router.get('/:userId/stats', authenticateJWT, userController.getUserStats);

module.exports = router;
