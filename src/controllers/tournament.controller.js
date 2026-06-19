const { Op } = require('sequelize');
const sequelize = require('../config/database');
const TournamentService = require('../services/tournament.service');
const ScoringService = require('../services/scoring.service');
const {
  Tournament, TournamentParticipant, TournamentSpecialPrediction,
  Prediction, Match, Team, User, Round, League, Notification
} = require('../models');

// ─── GET /api/tournaments/admin/all ───────────────────────────────
exports.listTournamentsAdmin = async (req, res) => {
  try {
    const tournaments = await TournamentService.listTournamentsForAdmin();
    res.json({ success: true, data: tournaments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments ─────────────────────────────────────────
exports.listTournaments = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const tournaments = await TournamentService.listTournaments(userId);
    res.json({ success: true, data: tournaments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id ─────────────────────────────────────
exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: League, as: 'league', attributes: ['id', 'name'] }
      ]
    });
    if (!tournament) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });

    const userId = req.user?.id;
    let participation = null;
    if (userId) {
      participation = await TournamentParticipant.findOne({
        where: { tournament_id: tournament.id, user_id: userId }
      });
    }

    const totalParticipants = await TournamentParticipant.count({
      where: { tournament_id: tournament.id, is_active: true }
    });

    res.json({
      success: true,
      data: {
        ...tournament.toJSON(),
        total_participants: totalParticipants,
        user_joined: !!participation?.is_active,
        user_stats: participation ? {
          total_points: participation.total_points,
          match_points: participation.match_points,
          special_points: participation.special_points,
          correct_predictions: participation.correct_predictions
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/tournaments/:id/join ───────────────────────────────
exports.joinTournament = async (req, res) => {
  try {
    const { access_code } = req.body;
    const { participant, created, rejoined } = await TournamentService.joinTournament(
      req.user.id,
      req.params.id,
      access_code
    );
    res.json({
      success: true,
      message: created ? 'Te has unido al torneo' : rejoined ? 'Bienvenido de nuevo' : 'Ya eres participante',
      data: participant
    });
  } catch (err) {
    const status = err.message.includes('inválido') || err.message.includes('lleno') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─── POST /api/tournaments/join-by-code ───────────────────────────
exports.joinByCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Código requerido' });
    const result = await TournamentService.joinByCode(req.user.id, code);
    res.json({ success: true, message: 'Te has unido al torneo', data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id/matches ─────────────────────────────
exports.getTournamentMatches = async (req, res) => {
  try {
    const { phase, group } = req.query;
    const userId = req.user?.id;
    const matches = await TournamentService.getWorldCupMatches(userId, req.params.id, phase, group);
    res.json({ success: true, data: matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/tournaments/:id/predict/:matchId ───────────────────
exports.predictMatch = async (req, res) => {
  try {
    const { home_score, away_score } = req.body;
    const { id: tournamentId, matchId } = req.params;

    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({ success: false, message: 'Se requieren home_score y away_score' });
    }

    // Verificar que el usuario es participante activo
    const participant = await TournamentParticipant.findOne({
      where: { tournament_id: tournamentId, user_id: req.user.id, is_active: true }
    });
    if (!participant) return res.status(403).json({ success: false, message: 'No eres participante de este torneo' });

    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Partido no encontrado' });
    if (match.predictions_locked || match.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Las predicciones de este partido están cerradas' });
    }

    const [prediction, created] = await Prediction.findOrCreate({
      where: { user_id: req.user.id, match_id: matchId, tournament_id: tournamentId },
      defaults: {
        user_id: req.user.id,
        match_id: matchId,
        tournament_id: tournamentId,
        prediction_type: 'score',
        prediction_data: { home_score: parseInt(home_score), away_score: parseInt(away_score) }
      }
    });

    if (!created) {
      await prediction.update({
        prediction_data: { home_score: parseInt(home_score), away_score: parseInt(away_score) },
        is_processed: false,
        points_earned: 0
      });
    }

    res.json({
      success: true,
      message: created ? 'Predicción guardada' : 'Predicción actualizada',
      data: prediction
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id/special-prediction ──────────────────
exports.getSpecialPrediction = async (req, res) => {
  try {
    const sp = await TournamentSpecialPrediction.findOne({
      where: { tournament_id: req.params.id, user_id: req.user.id },
      include: [
        { model: Team, as: 'champion_team', attributes: ['id', 'name', 'short_name', 'logo'] },
        { model: Team, as: 'runner_up_team', attributes: ['id', 'name', 'short_name', 'logo'] },
        { model: Team, as: 'third_place_team', attributes: ['id', 'name', 'short_name', 'logo'] }
      ]
    });
    res.json({ success: true, data: sp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/tournaments/:id/special-prediction ─────────────────
exports.saveSpecialPrediction = async (req, res) => {
  try {
    const { champion_team_id, runner_up_team_id, third_place_team_id } = req.body;
    const tournamentId = req.params.id;

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });
    if (!tournament.special_predictions_enabled) {
      return res.status(400).json({ success: false, message: 'Este torneo no tiene menciones especiales' });
    }
    if (tournament.special_predictions_locked) {
      return res.status(400).json({ success: false, message: 'Las menciones especiales están cerradas' });
    }

    const participant = await TournamentParticipant.findOne({
      where: { tournament_id: tournamentId, user_id: req.user.id, is_active: true }
    });
    if (!participant) return res.status(403).json({ success: false, message: 'No eres participante de este torneo' });

    // Validar que son equipos diferentes
    const ids = [champion_team_id, runner_up_team_id, third_place_team_id].filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ success: false, message: 'No puedes seleccionar el mismo equipo para dos posiciones' });
    }

    const tournamentTeams = await TournamentService.getTournamentTeams(tournamentId);
    const validIds = new Set(tournamentTeams.map((t) => t.id));
    if (!ids.every((id) => validIds.has(id))) {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes elegir equipos que participan en los partidos de este torneo',
      });
    }

    const [sp, created] = await TournamentSpecialPrediction.findOrCreate({
      where: { tournament_id: tournamentId, user_id: req.user.id },
      defaults: { tournament_id: tournamentId, user_id: req.user.id, champion_team_id, runner_up_team_id, third_place_team_id }
    });

    if (!created) {
      await sp.update({ champion_team_id, runner_up_team_id, third_place_team_id, is_processed: false });
    }

    res.json({ success: true, message: 'Menciones especiales guardadas', data: sp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id/leaderboard ─────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const leaderboard = await TournamentService.getLeaderboard(req.params.id, limit, offset);

    let userPosition = null;
    if (req.user) {
      userPosition = await TournamentService.getUserPosition(req.params.id, req.user.id);
    }

    res.json({ success: true, data: leaderboard, user_position: userPosition });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id/groups ──────────────────────────────
exports.getGroups = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id, {
      include: [{ model: League, as: 'league' }]
    });
    if (!tournament) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });

    const groups = await TournamentService.getWorldCupGroups(tournament.league_id);
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id/teams ───────────────────────────────
exports.getTournamentTeams = async (req, res) => {
  try {
    const teams = await TournamentService.getTournamentTeams(req.params.id);
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: POST /api/tournaments ─────────────────────────────────
exports.createTournament = async (req, res) => {
  try {
    const {
      name, description, league_id, type, start_date, end_date, max_participants,
      champion_points, runner_up_points, third_place_points,
      special_predictions_enabled, scoring_rules, image
    } = req.body;

    let access_code = null;
    if (type === 'private') {
      access_code = req.body.access_code?.toUpperCase() ||
        Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const specialsEnabled = special_predictions_enabled !== false;

    const tournament = await Tournament.create({
      name, description, league_id, type, access_code,
      start_date, end_date, max_participants,
      champion_points: specialsEnabled ? (champion_points ?? 45) : 0,
      runner_up_points: specialsEnabled ? (runner_up_points ?? 35) : 0,
      third_place_points: specialsEnabled ? (third_place_points ?? 25) : 0,
      special_predictions_enabled: specialsEnabled,
      scoring_rules: scoring_rules || ScoringService.getDefaultScoreRules(),
      image: image || null,
      created_by: req.user.id
    });

    res.status(201).json({ success: true, data: tournament });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: PUT /api/tournaments/:id ──────────────────────────────
exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });

    const allowed = [
      'name', 'description', 'league_id', 'type', 'start_date', 'end_date',
      'max_participants', 'champion_points', 'runner_up_points', 'third_place_points',
      'special_predictions_enabled', 'scoring_rules', 'image', 'access_code'
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.type === 'public') updates.access_code = null;
    if (updates.access_code) updates.access_code = updates.access_code.toUpperCase();

    await tournament.update(updates);
    res.json({ success: true, data: tournament });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: PUT /api/tournaments/:id/status ───────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, special_predictions_locked } = req.body;
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });

    const updates = {};
    if (status) updates.status = status;
    if (special_predictions_locked !== undefined) updates.special_predictions_locked = special_predictions_locked;

    await tournament.update(updates);
    res.json({ success: true, data: tournament });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: POST /api/tournaments/:id/matches/:matchId/result ─────
exports.submitMatchResult = async (req, res) => {
  try {
    const { home_score, away_score } = req.body;
    const { id: tournamentId, matchId } = req.params;

    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({ success: false, message: 'Se requieren home_score y away_score' });
    }

    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Partido no encontrado' });

    await match.update({
      home_score: parseInt(home_score),
      away_score: parseInt(away_score),
      status: 'finished',
      predictions_locked: true
    });

    // Procesar predicciones automáticamente
    const result = await TournamentService.processMatchPredictions(matchId, tournamentId);

    res.json({
      success: true,
      message: `Resultado cargado. ${result.processed} predicciones procesadas.`,
      data: { match, predictions_processed: result.processed }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: DELETE /api/tournaments/:id/participants/:userId ──────
exports.removeParticipant = async (req, res) => {
  try {
    const { id: tournamentId, userId } = req.params;
    const participant = await TournamentParticipant.findOne({
      where: { tournament_id: tournamentId, user_id: userId }
    });
    if (!participant) return res.status(404).json({ success: false, message: 'Participante no encontrado' });

    await participant.update({ is_active: false });
    res.json({ success: true, message: 'Participante removido del torneo' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: POST /api/tournaments/:id/process-specials ────────────
exports.processSpecialPredictions = async (req, res) => {
  try {
    const { champion_team_id, runner_up_team_id, third_place_team_id } = req.body;
    if (!champion_team_id || !runner_up_team_id || !third_place_team_id) {
      return res.status(400).json({ success: false, message: 'Se requieren los tres equipos finalistas' });
    }

    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });
    if (!tournament.special_predictions_enabled) {
      return res.status(400).json({ success: false, message: 'Este torneo no tiene menciones especiales' });
    }

    const result = await TournamentService.processSpecialPredictions(
      req.params.id, champion_team_id, runner_up_team_id, third_place_team_id
    );
    res.json({ success: true, message: `${result.processed} menciones especiales procesadas`, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: POST /api/tournaments/:id/banner ──────────────────────
exports.uploadTournamentBanner = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Torneo no encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se ha proporcionado ninguna imagen' });
    }

    if (tournament.image && tournament.image.includes('/uploads/tournaments/')) {
      const fs = require('fs');
      const path = require('path');
      const oldImagePath = path.join(__dirname, '../../', tournament.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imageUrl = `/uploads/tournaments/${req.file.filename}`;
    tournament.image = imageUrl;
    await tournament.save();

    res.json({
      success: true,
      message: 'Banner actualizado exitosamente',
      data: { image: imageUrl, tournament }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: DELETE /api/tournaments/:id/banner ──────────────────────
exports.deleteTournamentBanner = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Torneo no encontrado' });
    }

    if (tournament.image && tournament.image.includes('/uploads/tournaments/')) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '../../', tournament.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    tournament.image = null;
    await tournament.save();

    res.json({
      success: true,
      message: 'Banner eliminado exitosamente',
      data: { tournament }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id/participants ─────────────────────────
exports.getParticipants = async (req, res) => {
  try {
    const { active } = req.query;
    const where = { tournament_id: req.params.id };

    if (active === 'true') where.is_active = true;
    else if (active === 'false') where.is_active = false;

    const participants = await TournamentParticipant.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar', 'email'] }],
      order: [['is_active', 'DESC'], ['joined_at', 'DESC']]
    });
    res.json({ success: true, data: participants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/tournaments/:id/my-predictions ──────────────────────
exports.getMyPredictions = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const tournament = await Tournament.findByPk(tournamentId, {
      include: [{ model: League, as: 'league' }]
    });
    if (!tournament) return res.status(404).json({ success: false, message: 'Torneo no encontrado' });

    const matches = await Match.findAll({
      where: { league_id: tournament.league_id },
      include: [
        { model: Team, as: 'home_team', attributes: ['id', 'name', 'short_name', 'logo'] },
        { model: Team, as: 'away_team', attributes: ['id', 'name', 'short_name', 'logo'] },
        { model: Round, as: 'roundInfo', attributes: ['id', 'name', 'round_type', 'metadata'] }
      ],
      order: [['match_date', 'ASC']]
    });

    const matchIds = matches.map(m => m.id);
    const predictions = await Prediction.findAll({
      where: { user_id: req.user.id, match_id: { [Op.in]: matchIds }, tournament_id: tournamentId }
    });
    const predMap = {};
    predictions.forEach(p => { predMap[p.match_id] = p; });

    const specialPrediction = await TournamentSpecialPrediction.findOne({
      where: { tournament_id: tournamentId, user_id: req.user.id },
      include: [
        { model: Team, as: 'champion_team', attributes: ['id', 'name', 'short_name', 'logo'] },
        { model: Team, as: 'runner_up_team', attributes: ['id', 'name', 'short_name', 'logo'] },
        { model: Team, as: 'third_place_team', attributes: ['id', 'name', 'short_name', 'logo'] }
      ]
    });

    res.json({
      success: true,
      data: {
        matches: matches.map(m => ({ ...m.toJSON(), user_prediction: predMap[m.id] || null })),
        special_prediction: specialPrediction
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
