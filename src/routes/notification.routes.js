const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// Notification routes
router.get('/', authenticateJWT, notificationController.getNotifications);
router.put('/:notificationId/read', authenticateJWT, notificationController.markAsRead);
router.put('/read-all', authenticateJWT, notificationController.markAllAsRead);
router.delete('/:notificationId', authenticateJWT, notificationController.deleteNotification);

module.exports = router;
