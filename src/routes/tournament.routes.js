const express = require('express');
const router = express.Router();
const passport = require('passport');
const tc = require('../controllers/tournament.controller');
const { uploadTournamentBanner } = require('../middlewares/upload.middleware');

const auth = passport.authenticate('jwt', { session: false });
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) req.user = user;
    next();
  })(req, res, next);
};

const isAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};

// ─── Rutas públicas / con auth opcional ───────────────────────────
router.get('/', optionalAuth, tc.listTournaments);
router.get('/admin/all', auth, isAdmin, tc.listTournamentsAdmin);
router.get('/:id', optionalAuth, tc.getTournament);
router.get('/:id/matches', optionalAuth, tc.getTournamentMatches);
router.get('/:id/leaderboard', optionalAuth, tc.getLeaderboard);
router.get('/:id/groups', tc.getGroups);
router.get('/:id/teams', tc.getTournamentTeams);

// ─── Rutas autenticadas (usuario) ─────────────────────────────────
router.post('/:id/join', auth, tc.joinTournament);
router.post('/join-by-code', auth, tc.joinByCode);
router.post('/:id/predict/:matchId', auth, tc.predictMatch);
router.get('/:id/special-prediction', auth, tc.getSpecialPrediction);
router.post('/:id/special-prediction', auth, tc.saveSpecialPrediction);
router.get('/:id/my-predictions', auth, tc.getMyPredictions);
router.get('/:id/participants', auth, tc.getParticipants);

// ─── Rutas admin ───────────────────────────────────────────────────
router.post('/', auth, isAdmin, tc.createTournament);
router.put('/:id', auth, isAdmin, tc.updateTournament);
router.put('/:id/status', auth, isAdmin, tc.updateStatus);
router.post('/:id/banner', auth, isAdmin, uploadTournamentBanner.single('banner'), tc.uploadTournamentBanner);
router.delete('/:id/banner', auth, isAdmin, tc.deleteTournamentBanner);
router.post('/:id/matches/:matchId/result', auth, isAdmin, tc.submitMatchResult);
router.delete('/:id/participants/:userId', auth, isAdmin, tc.removeParticipant);
router.post('/:id/process-specials', auth, isAdmin, tc.processSpecialPredictions);

module.exports = router;
