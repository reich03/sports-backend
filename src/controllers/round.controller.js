const { Round, League, Sport, Match, Team, Prediction, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all rounds (with optional filters)
 */
exports.getAllRounds = async (req, res) => {
  try {
    const { league_id, sport_id, round_type, is_active } = req.query;

    const where = {};
    if (league_id) where.league_id = league_id;
    if (sport_id) where.sport_id = sport_id;
    if (round_type) where.round_type = round_type;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const rounds = await Round.findAll({
      where,
      include: [
        {
          model: League,
          as: 'league',
          attributes: ['id', 'name', 'logo', 'season']
        },
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name', 'code', 'icon']
        },
        {
          model: Match,
          as: 'matches',
          attributes: ['id', 'match_date', 'status'],
          include: [
            {
              model: Team,
              as: 'home_team',
              attributes: ['id', 'short_name', 'logo']
            },
            {
              model: Team,
              as: 'away_team',
              attributes: ['id', 'short_name', 'logo']
            }
          ]
        }
      ],
      order: [
        ['round_number', 'ASC'],
        ['start_date', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: rounds,
      count: rounds.length
    });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jornadas',
      error: error.message
    });
  }
};

/**
 * Get a single round by ID
 */
exports.getRoundById = async (req, res) => {
  try {
    const { id } = req.params;

    const round = await Round.findByPk(id, {
      include: [
        {
          model: League,
          as: 'league',
          attributes: ['id', 'name', 'logo', 'season', 'country']
        },
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name', 'code', 'icon', 'prediction_type']
        },
        {
          model: Match,
          as: 'matches',
          include: [
            {
              model: Team,
              as: 'home_team',
              attributes: ['id', 'name', 'short_name', 'logo']
            },
            {
              model: Team,
              as: 'away_team',
              attributes: ['id', 'name', 'short_name', 'logo']
            }
          ],
          order: [['match_date', 'ASC']]
        }
      ]
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Jornada no encontrada'
      });
    }

    res.json({
      success: true,
      data: round
    });
  } catch (error) {
    console.error('Error fetching round:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jornada',
      error: error.message
    });
  }
};

/**
 * Create a new round
 */
exports.createRound = async (req, res) => {
  try {
    const {
      league_id,
      sport_id,
      name,
      round_type,
      round_number,
      start_date,
      end_date,
      metadata
    } = req.body;

    // Validation
    if (!sport_id) {
      return res.status(400).json({
        success: false,
        message: 'El deporte es requerido'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la jornada es requerido'
      });
    }

    // Verify sport exists
    const sport = await Sport.findByPk(sport_id);
    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Deporte no encontrado'
      });
    }

    // If league_id provided, verify it exists
    if (league_id) {
      const league = await League.findByPk(league_id);
      if (!league) {
        return res.status(404).json({
          success: false,
          message: 'Liga no encontrada'
        });
      }

      // Verify league belongs to the sport
      if (league.sport_id !== sport_id) {
        return res.status(400).json({
          success: false,
          message: 'La liga no pertenece al deporte seleccionado'
        });
      }
    }

    const round = await Round.create({
      league_id: league_id || null,
      sport_id,
      name,
      round_type: round_type || 'regular',
      round_number,
      start_date,
      end_date,
      metadata: metadata || {}
    });

    const createdRound = await Round.findByPk(round.id, {
      include: [
        {
          model: League,
          as: 'league',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name', 'code', 'icon']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Jornada creada exitosamente',
      data: createdRound
    });
  } catch (error) {
    console.error('Error creating round:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear jornada',
      error: error.message
    });
  }
};

/**
 * Update a round
 */
exports.updateRound = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      round_type,
      round_number,
      start_date,
      end_date,
      is_active,
      metadata
    } = req.body;

    const round = await Round.findByPk(id);

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Jornada no encontrada'
      });
    }

    await round.update({
      name: name !== undefined ? name : round.name,
      round_type: round_type !== undefined ? round_type : round.round_type,
      round_number: round_number !== undefined ? round_number : round.round_number,
      start_date: start_date !== undefined ? start_date : round.start_date,
      end_date: end_date !== undefined ? end_date : round.end_date,
      is_active: is_active !== undefined ? is_active : round.is_active,
      metadata: metadata !== undefined ? metadata : round.metadata
    });

    const updatedRound = await Round.findByPk(id, {
      include: [
        {
          model: League,
          as: 'league',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name', 'code', 'icon']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Jornada actualizada exitosamente',
      data: updatedRound
    });
  } catch (error) {
    console.error('Error updating round:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar jornada',
      error: error.message
    });
  }
};

/**
 * Delete a round
 */
exports.deleteRound = async (req, res) => {
  try {
    const { id } = req.params;

    const round = await Round.findByPk(id, {
      include: [{
        model: Match,
        as: 'matches'
      }]
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Jornada no encontrada'
      });
    }

    // Check if round has matches
    if (round.matches && round.matches.length > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la jornada porque tiene ${round.matches.length} partido(s) asociado(s)`
      });
    }

    await round.destroy();

    res.json({
      success: true,
      message: 'Jornada eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting round:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar jornada',
      error: error.message
    });
  }
};

/**
 * Get rounds by league
 */
exports.getRoundsByLeague = async (req, res) => {
  try {
    const { leagueId } = req.params;

    const rounds = await Round.findAll({
      where: { league_id: leagueId },
      include: [
        {
          model: Match,
          as: 'matches',
          attributes: ['id', 'match_date', 'status'],
          include: [
            {
              model: Team,
              as: 'home_team',
              attributes: ['id', 'short_name', 'logo']
            },
            {
              model: Team,
              as: 'away_team',
              attributes: ['id', 'short_name', 'logo']
            }
          ]
        }
      ],
      order: [
        ['round_number', 'ASC'],
        ['start_date', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: rounds,
      count: rounds.length
    });
  } catch (error) {
    console.error('Error fetching rounds by league:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener jornadas de la liga',
      error: error.message
    });
  }
};

/**
 * Close round and process all matches
 */
exports.closeRound = async (req, res) => {
  try {
    const { id } = req.params;
    
    const round = await Round.findByPk(id, {
      include: [
        {
          model: Match,
          as: 'matches',
          include: [
            { model: Sport, as: 'sport' }
          ]
        }
      ]
    });
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Jornada no encontrada'
      });
    }
    
    const matches = round.matches || [];
    
    if (matches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La jornada no tiene partidos asociados'
      });
    }
    
    // Verificar que todos los partidos tengan marcador
    const matchesWithoutScore = matches.filter(m => 
      m.home_score === null || m.away_score === null
    );
    
    if (matchesWithoutScore.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${matchesWithoutScore.length} partido(s) no tienen marcador final. Todos los partidos deben tener marcador antes de cerrar la jornada.`,
        matches_pending: matchesWithoutScore.map(m => ({
          id: m.id,
          home_team: m.home_team?.short_name,
          away_team: m.away_team?.short_name,
          match_date: m.match_date
        }))
      });
    }
    
    // Procesar todos los partidos que no estén finalizados
    const PredictionService = require('../services/prediction.service');
    const results = {
      total_matches: matches.length,
      processed_matches: 0,
      total_predictions: 0,
      errors: []
    };
    
    for (const match of matches) {
      try {
        if (match.status !== 'finished') {
          match.status = 'finished';
          match.predictions_locked = true;
          await match.save();
        }
        
        // Procesar predicciones del partido
        const processResult = await PredictionService.processPredictions(match.id);
        results.processed_matches++;
        results.total_predictions += processResult.processed;
      } catch (error) {
        results.errors.push({
          match_id: match.id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Jornada cerrada y predicciones procesadas',
      data: {
        round,
        processing_results: results
      }
    });
  } catch (error) {
    console.error('Error closing round:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar jornada',
      error: error.message
    });
  }
};

/**
 * Get all predictions for a round
 */
exports.getRoundPredictions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 100 } = req.query;
    
    const round = await Round.findByPk(id, {
      include: [
        {
          model: Match,
          as: 'matches',
          attributes: ['id']
        }
      ]
    });
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Jornada no encontrada'
      });
    }
    
    const matchIds = round.matches.map(m => m.id);
    
    if (matchIds.length === 0) {
      return res.json({
        success: true,
        data: {
          predictions: [],
          stats: {
            total_predictions: 0,
            processed: 0,
            pending: 0,
            correct: 0,
            total_points_awarded: 0,
            total_matches: 0
          },
          pagination: {
            total: 0,
            page: 1,
            pages: 0
          }
        }
      });
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: predictions } = await Prediction.findAndCountAll({
      where: {
        match_id: matchIds
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'avatar', 'total_points']
        },
        {
          model: Match,
          as: 'match',
          attributes: ['id', 'match_date', 'status', 'home_score', 'away_score'],
          include: [
            {
              model: Team,
              as: 'home_team',
              attributes: ['id', 'short_name', 'logo']
            },
            {
              model: Team,
              as: 'away_team',
              attributes: ['id', 'short_name', 'logo']
            }
          ]
        }
      ],
      order: [
        ['is_processed', 'ASC'],
        ['points_earned', 'DESC'],
        ['created_at', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Stats
    const stats = {
      total_predictions: count,
      processed: predictions.filter(p => p.is_processed).length,
      pending: predictions.filter(p => !p.is_processed).length,
      correct: predictions.filter(p => p.is_correct === true).length,
      total_points_awarded: predictions.reduce((sum, p) => sum + (p.points_earned || 0), 0),
      total_matches: matchIds.length
    };
    
    res.json({
      success: true,
      data: {
        predictions,
        stats,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching round predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener predicciones de la jornada',
      error: error.message
    });
  }
};
