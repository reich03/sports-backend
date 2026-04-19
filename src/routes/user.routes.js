const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isOwnerOrAdmin, isAdmin } = require('../middlewares/role.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

// Admin routes - must be before parameterized routes
router.get('/', authenticateJWT, isAdmin, userController.getAllUsers);
router.post('/', authenticateJWT, isAdmin, userController.createUser);

// Get user profile
router.get('/:userId', authenticateJWT, userController.getUserProfile);

// Update user profile
router.put('/:userId', authenticateJWT, isOwnerOrAdmin(), userController.updateUserProfile);

// Update user role (admin only)
router.put('/:userId/role', authenticateJWT, isAdmin, userController.updateUserRole);

// Delete user (admin only)
router.delete('/:userId', authenticateJWT, isAdmin, userController.deleteUser);

// Get user predictions history
router.get('/:userId/predictions', authenticateJWT, userController.getUserPredictions);

// Get user statistics
router.get('/:userId/stats', authenticateJWT, userController.getUserStats);

// Upload user avatar
router.post('/:userId/avatar', authenticateJWT, isOwnerOrAdmin(), uploadAvatar.single('avatar'), userController.uploadAvatar);

// Delete user avatar
router.delete('/:userId/avatar', authenticateJWT, isOwnerOrAdmin(), userController.deleteAvatar);

module.exports = router;
