const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// Group routes
router.post('/', authenticateJWT, groupController.createGroup);
router.get('/my-groups', authenticateJWT, groupController.getMyGroups);
router.get('/:groupId', authenticateJWT, groupController.getGroupById);
router.put('/:groupId', authenticateJWT, groupController.updateGroup);
router.delete('/:groupId', authenticateJWT, groupController.deleteGroup);
router.post('/:groupId/join', authenticateJWT, groupController.joinGroup);
router.post('/:groupId/leave', authenticateJWT, groupController.leaveGroup);
router.get('/:groupId/ranking', authenticateJWT, groupController.getGroupRanking);

module.exports = router;
