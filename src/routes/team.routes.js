const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { uploadTeamLogo } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', teamController.getAllTeams);
router.get('/:teamId', teamController.getTeamById);
router.get('/sport/:sportId', teamController.getTeamsBySport);

// Admin routes
router.post('/', authenticateJWT, isAdmin, teamController.createTeam);
router.put('/:teamId', authenticateJWT, isAdmin, teamController.updateTeam);
router.delete('/:teamId', authenticateJWT, isAdmin, teamController.deleteTeam);

// Upload/Delete team logo
router.post('/:teamId/logo', authenticateJWT, isAdmin, uploadTeamLogo.single('logo'), teamController.uploadTeamLogo);
router.delete('/:teamId/logo', authenticateJWT, isAdmin, teamController.deleteTeamLogo);

module.exports = router;
