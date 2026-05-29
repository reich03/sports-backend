const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
  Tournament, TournamentParticipant, TournamentSpecialPrediction,
  Prediction, Match, Team, User, Round, Notification
} = require('../models');

class TournamentService {
  // ─── Buscar torneo público del Mundial activo ──────────────────
  static async getPublicWorldCupTournament() {
    return Tournament.findOne({
      where: { type: 'public', status: { [Op.in]: ['upcoming', 'active'] } },
      order: [['created_at', 'DESC']]
    });
  }

  // ─── Unirse a un torneo ────────────────────────────────────────
  static async joinTournament(userId, tournamentId, accessCode = null) {
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) throw new Error('Torneo no encontrado');
    if (tournament.status === 'finished') throw new Error('Este torneo ya finalizó');

    // Verificar código de acceso para torneos privados
    if (tournament.type === 'private') {
      if (!accessCode || accessCode.toUpperCase() !== tournament.access_code?.toUpperCase()) {
        throw new Error('Código de acceso inválido');
      }
    }

    // Verificar límite de participantes
    if (tournament.max_participants) {
      const count = await TournamentParticipant.count({ where: { tournament_id: tournamentId, is_active: true } });
      if (count >= tournament.max_participants) throw new Error('El torneo está lleno');
    }

    const [participant, created] = await TournamentParticipant.findOrCreate({
      where: { tournament_id: tournamentId, user_id: userId },
      defaults: { tournament_id: tournamentId, user_id: userId }
    });

    if (!created && !participant.is_active) {
      await participant.update({ is_active: true });
      return { participant, rejoined: true };
    }

    return { participant, created };
  }

  // ─── Unirse por código (torneos privados) ─────────────────────
  static async joinByCode(userId, accessCode) {
    const tournament = await Tournament.findOne({
      where: { access_code: accessCode.toUpperCase(), type: 'private' }
    });
    if (!tournament) throw new Error('Código de acceso inválido o torneo no encontrado');
    return this.joinTournament(userId, tournament.id, accessCode);
  }

  // ─── Obtener partidos del Mundial con predicción del usuario ──
  static async getWorldCupMatches(userId, tournamentId, phase = null, group = null) {
    const tournament = await Tournament.findByPk(tournamentId, {
      include: [{ model: require('../models').League, as: 'league' }]
    });
    if (!tournament) throw new Error('Torneo no encontrado');

    const roundWhere = {};
    if (group) roundWhere['metadata'] = { [Op.contains]: { group } };
    if (phase) roundWhere.round_type = phase;

    const matches = await Match.findAll({
      where: {
        league_id: tournament.league_id,
        status: { [Op.in]: ['scheduled', 'live', 'finished'] }
      },
      include: [
        { model: Team, as: 'home_team', attributes: ['id', 'name', 'short_name', 'logo', 'country'] },
        { model: Team, as: 'away_team', attributes: ['id', 'name', 'short_name', 'logo', 'country'] },
        { model: Round, as: 'roundInfo', where: Object.keys(roundWhere).length ? roundWhere : undefined, required: !!group || !!phase, attributes: ['id', 'name', 'round_type', 'round_number', 'metadata'] }
      ],
      order: [['match_date', 'ASC']]
    });

    // Si hay usuario, agregar sus predicciones filtradas por torneo
    if (userId) {
      const matchIds = matches.map(m => m.id);
      const predictions = await Prediction.findAll({
        where: { user_id: userId, match_id: { [Op.in]: matchIds }, tournament_id: tournamentId }
      });
      const predMap = {};
      predictions.forEach(p => { predMap[p.match_id] = p; });

      return matches.map(m => ({
        ...m.toJSON(),
        user_prediction: predMap[m.id] || null
      }));
    }

    return matches.map(m => m.toJSON());
  }

  // ─── Calcular puntos según reglas del Mundial ─────────────────
  static calculateWorldCupPoints(predData, match, scoringRules) {
    const {
      exact_score = 10,
      correct_winner = 5,
      correct_draw = 5,
      home_goal_bonus = 2,
      away_goal_bonus = 2,
      strict_winner = true
    } = scoringRules;

    const predHome = predData?.home_score;
    const predAway = predData?.away_score;
    const actualHome = match.home_score;
    const actualAway = match.away_score;

    if (predHome === undefined || predAway === undefined || actualHome === null || actualAway === null) {
      return { points: 0, isCorrect: false };
    }

    // Resultado exacto: 10 pts (plano, no 5+2+2)
    if (predHome === actualHome && predAway === actualAway) {
      return { points: exact_score, isCorrect: true };
    }

    const predResult = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
    const actualResult = actualHome > actualAway ? 'home' : (actualHome < actualAway ? 'away' : 'draw');

    // Ganador/empate correcto
    if (predResult === actualResult) {
      let points = actualResult === 'draw' ? correct_draw : correct_winner;
      let isCorrect = true;

      // Bonus de goles locales (+2 si acertó)
      if (predHome === actualHome) points += home_goal_bonus;
      // Bonus de goles visitantes (+2 si acertó)
      if (predAway === actualAway) points += away_goal_bonus;

      return { points, isCorrect };
    }

    // Ganador incorrecto - en modo estricto no hay puntos
    if (strict_winner) {
      return { points: 0, isCorrect: false };
    }

    // Modo no estricto: puntos por goles individuales
    let points = 0;
    if (predHome === actualHome) points += home_goal_bonus;
    if (predAway === actualAway) points += away_goal_bonus;
    return { points, isCorrect: points > 0 };
  }

  // ─── Procesar predicciones de un partido del Mundial ─────────
  static async processMatchPredictions(matchId, tournamentId) {
    const transaction = await sequelize.transaction();
    try {
      const match = await Match.findByPk(matchId);
      if (!match || match.status !== 'finished') throw new Error('Partido no finalizado');
      if (match.home_score === null || match.away_score === null) throw new Error('Sin resultados');

      const tournament = await Tournament.findByPk(tournamentId);
      if (!tournament) throw new Error('Torneo no encontrado');

      const scoringRules = tournament.scoring_rules;

      // Solo predicciones de participantes activos del torneo
      const participants = await TournamentParticipant.findAll({
        where: { tournament_id: tournamentId, is_active: true }
      });
      const participantUserIds = participants.map(p => p.user_id);

      const predictions = await Prediction.findAll({
        where: { match_id: matchId, tournament_id: tournamentId, is_processed: false, user_id: { [Op.in]: participantUserIds } }
      });

      let processedCount = 0;

      for (const prediction of predictions) {
        const { points, isCorrect } = this.calculateWorldCupPoints(
          prediction.prediction_data,
          match,
          scoringRules
        );

        prediction.points_earned = points;
        prediction.is_correct = isCorrect;
        prediction.is_processed = true;
        await prediction.save({ transaction });

        // Actualizar puntos del participante en el torneo
        await TournamentParticipant.increment(
          { total_points: points, match_points: points, total_predictions: 1, correct_predictions: isCorrect ? 1 : 0 },
          { where: { tournament_id: tournamentId, user_id: prediction.user_id }, transaction }
        );

        // Notificación
        const notifMsg = points === 0
          ? 'Tu predicción no sumó puntos esta vez.'
          : points >= 10
            ? `¡Resultado exacto! Has ganado ${points} puntos en el Mundial.`
            : `¡Acertaste! Has ganado ${points} puntos en el Mundial.`;

        await Notification.create({
          user_id: prediction.user_id,
          type: 'match',
          title: points > 0 ? '¡Puntos del Mundial!' : 'Predicción procesada',
          message: notifMsg,
          data: { match_id: matchId, prediction_id: prediction.id, points_earned: points, tournament_id: tournamentId }
        }, { transaction });

        processedCount++;
      }

      await transaction.commit();
      return { processed: processedCount, total: predictions.length };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ─── Procesar menciones especiales al finalizar el torneo ─────
  static async processSpecialPredictions(tournamentId, championId, runnerUpId, thirdPlaceId) {
    const transaction = await sequelize.transaction();
    try {
      const tournament = await Tournament.findByPk(tournamentId);
      if (!tournament) throw new Error('Torneo no encontrado');

      const specials = await TournamentSpecialPrediction.findAll({
        where: { tournament_id: tournamentId, is_processed: false }
      });

      for (const sp of specials) {
        let championPts = sp.champion_team_id === championId ? tournament.champion_points : 0;
        let runnerUpPts = sp.runner_up_team_id === runnerUpId ? tournament.runner_up_points : 0;
        let thirdPts = sp.third_place_team_id === thirdPlaceId ? tournament.third_place_points : 0;
        const totalSpecialPts = championPts + runnerUpPts + thirdPts;

        await sp.update({
          champion_points_earned: championPts,
          runner_up_points_earned: runnerUpPts,
          third_place_points_earned: thirdPts,
          is_processed: true
        }, { transaction });

        if (totalSpecialPts > 0) {
          await TournamentParticipant.increment(
            { total_points: totalSpecialPts, special_points: totalSpecialPts },
            { where: { tournament_id: tournamentId, user_id: sp.user_id }, transaction }
          );

          await Notification.create({
            user_id: sp.user_id,
          type: 'achievement',
          title: '¡Puntos de Menciones Especiales!',
            message: `Has ganado ${totalSpecialPts} puntos por tus menciones especiales del Mundial.`,
            data: { tournament_id: tournamentId, champion_pts: championPts, runner_up_pts: runnerUpPts, third_place_pts: thirdPts }
          }, { transaction });

        }
      }

      await transaction.commit();
      return { processed: specials.length };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ─── Tabla de posiciones del torneo ───────────────────────────
  static async getLeaderboard(tournamentId, limit = 50, offset = 0) {
    const participants = await TournamentParticipant.findAll({
      where: { tournament_id: tournamentId, is_active: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'email']
      }],
      order: [['total_points', 'DESC'], ['correct_predictions', 'DESC']],
      limit,
      offset
    });

    return participants.map((p, idx) => ({
      position: offset + idx + 1,
      user: p.user,
      total_points: p.total_points,
      match_points: p.match_points,
      special_points: p.special_points,
      correct_predictions: p.correct_predictions,
      total_predictions: p.total_predictions,
      joined_at: p.joined_at
    }));
  }

  // ─── Posición del usuario en el torneo ────────────────────────
  static async getUserPosition(tournamentId, userId) {
    const participant = await TournamentParticipant.findOne({
      where: { tournament_id: tournamentId, user_id: userId }
    });
    if (!participant) return null;

    const position = await TournamentParticipant.count({
      where: {
        tournament_id: tournamentId,
        is_active: true,
        total_points: { [Op.gt]: participant.total_points }
      }
    });

    return {
      position: position + 1,
      total_points: participant.total_points,
      match_points: participant.match_points,
      special_points: participant.special_points,
      correct_predictions: participant.correct_predictions,
      total_predictions: participant.total_predictions
    };
  }

  // ─── Grupos del Mundial (informativo) ─────────────────────────
  static async getWorldCupGroups(leagueId) {
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    const result = {};

    for (const group of groups) {
      const rounds = await Round.findAll({
        where: {
          league_id: leagueId,
          round_type: 'group_stage'
        },
        attributes: ['metadata']
      });

      // Obtener equipos de este grupo a través de los partidos de la Jornada 1
      const jornada1 = await Round.findOne({
        where: {
          league_id: leagueId,
          round_type: 'group_stage',
          metadata: { [Op.contains]: { group, matchday: 1 } }
        }
      });

      if (jornada1) {
        const matches = await Match.findAll({
          where: { round_id: jornada1.id },
          include: [
            { model: Team, as: 'home_team', attributes: ['id', 'name', 'short_name', 'logo', 'country'] },
            { model: Team, as: 'away_team', attributes: ['id', 'name', 'short_name', 'logo', 'country'] }
          ]
        });

        const teams = [];
        for (const m of matches) {
          if (!teams.find(t => t.id === m.home_team.id)) teams.push(m.home_team);
          if (!teams.find(t => t.id === m.away_team.id)) teams.push(m.away_team);
        }
        result[group] = teams;
      }
    }

    return result;
  }

  // ─── Listar todos los torneos disponibles ─────────────────────
  static async listTournaments(userId = null) {
    const tournaments = await Tournament.findAll({
      where: { status: { [Op.in]: ['upcoming', 'active'] } },
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      order: [['created_at', 'DESC']]
    });

    // Contar participantes activos por torneo
    const ids = tournaments.map(t => t.id);
    const counts = await TournamentParticipant.findAll({
      where: { tournament_id: { [Op.in]: ids }, is_active: true },
      attributes: ['tournament_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['tournament_id'],
      raw: true
    });
    const countMap = {};
    counts.forEach(c => { countMap[c.tournament_id] = parseInt(c.count); });

    if (!userId) {
      return tournaments.map(t => ({
        ...t.toJSON(),
        total_participants: countMap[t.id] || 0
      }));
    }

    // Marcar cuáles ya se unió el usuario
    const participations = await TournamentParticipant.findAll({
      where: { user_id: userId, tournament_id: { [Op.in]: ids } }
    });
    const joinedIds = new Set(participations.filter(p => p.is_active).map(p => p.tournament_id));

    return tournaments.map(t => ({
      ...t.toJSON(),
      total_participants: countMap[t.id] || 0,
      is_joined: joinedIds.has(t.id)
    }));
  }
}

module.exports = TournamentService;
