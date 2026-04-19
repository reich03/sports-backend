const express = require('express');
const router = express.Router();
const roundController = require('../controllers/round.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

/**
 * @route   GET /api/rounds
 * @desc    Get all rounds (with optional filters)
 * @access  Private
 * @query   league_id, sport_id, round_type, is_active
 */
router.get('/', authenticateJWT, roundController.getAllRounds);

/**
 * @route   GET /api/rounds/league/:leagueId
 * @desc    Get all rounds for a specific league
 * @access  Private
 */
router.get('/league/:leagueId', authenticateJWT, roundController.getRoundsByLeague);

/**
 * @route   POST /api/rounds/:id/close
 * @desc    Close round and process all match predictions
 * @access  Admin only
 */
router.post('/:id/close', authenticateJWT, isAdmin, roundController.closeRound);

/**
 * @route   GET /api/rounds/:id/predictions
 * @desc    Get all predictions for a round
 * @access  Admin only
 */
router.get('/:id/predictions', authenticateJWT, isAdmin, roundController.getRoundPredictions);

/**
 * @route   GET /api/rounds/:id
 * @desc    Get a single round by ID
 * @access  Private
 */
router.get('/:id', authenticateJWT, roundController.getRoundById);

/**
 * @route   POST /api/rounds
 * @desc    Create a new round
 * @access  Admin only
 * @body    { league_id?, sport_id, name, round_type?, round_number?, start_date?, end_date?, metadata? }
 */
router.post('/', authenticateJWT, isAdmin, roundController.createRound);

/**
 * @route   PUT /api/rounds/:id
 * @desc    Update a round
 * @access  Admin only
 * @body    { name?, round_type?, round_number?, start_date?, end_date?, is_active?, metadata? }
 */
router.put('/:id', authenticateJWT, isAdmin, roundController.updateRound);

/**
 * @route   DELETE /api/rounds/:id
 * @desc    Delete a round
 * @access  Admin only
 */
router.delete('/:id', authenticateJWT, isAdmin, roundController.deleteRound);

module.exports = router;
