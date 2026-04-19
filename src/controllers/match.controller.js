const { Match, League, Sport, Team, Prediction, Round, User } = require('../models');
const { Op } = require('sequelize');

// Get all matches with filters
exports.getMatches = async (req, res, next) => {
  try {
    const { 
      sport_id, 
      league_id, 
      status, 
      date_from, 
      date_to,
      page = 1,
      limit = 20
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    if (sport_id) where.sport_id = sport_id;
    if (league_id) where.league_id = league_id;
    if (status) where.status = status;
    
    if (date_from || date_to) {
      where.match_date = {};
      if (date_from) where.match_date[Op.gte] = new Date(date_from);
      if (date_to) where.match_date[Op.lte] = new Date(date_to);
    }
    
    const { count, rows: matches } = await Match.findAndCountAll({
      where,
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'league' },
        { model: Round, as: 'roundInfo' },
        { model: Team, as: 'home_team' },
        { model: Team, as: 'away_team' }
      ],
      order: [['match_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      data: {
        matches,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming matches
exports.getUpcomingMatches = async (req, res, next) => {
  try {
    const { sport_id, league_id, limit = 10, exclude_predicted } = req.query;
    const where = {
      match_date: { [Op.gte]: new Date() },
      status: 'scheduled'
    };
    
    if (sport_id) where.sport_id = sport_id;
    if (league_id) where.league_id = league_id;
    
    let matches = await Match.findAll({
      where,
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'league' },
        { model: Round, as: 'roundInfo' },
        { model: Team, as: 'home_team' },
        { model: Team, as: 'away_team' }
      ],
      order: [['match_date', 'ASC']],
      limit: parseInt(limit) * 2 // Get more to filter
    });
    
    // If user is authenticated and wants to exclude already predicted matches
    if (exclude_predicted === 'true' && req.user) {
      const userPredictions = await Prediction.findAll({
        where: { user_id: req.user.id },
        attributes: ['match_id']
      });
      
      const predictedMatchIds = userPredictions.map(p => p.match_id);
      matches = matches.filter(m => !predictedMatchIds.includes(m.id));
      matches = matches.slice(0, parseInt(limit)); // Apply limit after filtering
    }
    
    res.json({
      data: { matches }
    });
  } catch (error) {
    next(error);
  }
};

// Get match by ID
exports.getMatchById = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    
    const match = await Match.findByPk(matchId, {
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'league' },
        { model: Round, as: 'roundInfo' },
        { model: Team, as: 'home_team' },
        { model: Team, as: 'away_team' }
      ]
    });
    
    if (!match) {
      return res.status(404).json({ 
        error: { message: 'Partido no encontrado' } 
      });
    }
    
    // If user is authenticated, get their prediction
    let userPrediction = null;
    if (req.user) {
      userPrediction = await Prediction.findOne({
        where: {
          user_id: req.user.id,
          match_id: matchId
        }
      });
    }
    
    res.json({
      data: { 
        match,
        user_prediction: userPrediction
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create match (Admin)
exports.createMatch = async (req, res, next) => {
  try {
    const { 
      league_id,
      sport_id,
      round_id,
      home_team_id,
      away_team_id,
      match_date,
      location,
      round
    } = req.body;
    
    const match = await Match.create({
      league_id: league_id || null,
      sport_id,
      round_id: round_id || null,
      home_team_id,
      away_team_id,
      match_date,
      location,
      round,
      lock_date: new Date(new Date(match_date).getTime() - 15 * 60 * 1000) // Lock 15 min before
    });
    
    res.status(201).json({
      message: 'Partido creado exitosamente',
      data: { match }
    });
  } catch (error) {
    next(error);
  }
};

// Update match (Admin)
exports.updateMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const updates = req.body;
    
    const match = await Match.findByPk(matchId);
    
    if (!match) {
      return res.status(404).json({ 
        error: { message: 'Partido no encontrado' } 
      });
    }
    
    await match.update(updates);
    
    res.json({
      message: 'Partido actualizado exitosamente',
      data: { match }
    });
  } catch (error) {
    next(error);
  }
};

// Delete match (Admin)
exports.deleteMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    
    const match = await Match.findByPk(matchId);
    
    if (!match) {
      return res.status(404).json({ 
        error: { message: 'Partido no encontrado' } 
      });
    }
    
    await match.destroy();
    
    res.json({
      message: 'Partido eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Submit match result (Admin) - Close match and process predictions
exports.submitMatchResult = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { home_score, away_score, result_data } = req.body;
    
    // Validate scores
    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({
        error: { message: 'Se requieren ambos marcadores (home_score y away_score)' }
      });
    }
    
    if (home_score < 0 || away_score < 0) {
      return res.status(400).json({
        error: { message: 'Los marcadores no pueden ser negativos' }
      });
    }
    
    const match = await Match.findByPk(matchId, {
      include: [{ model: Sport, as: 'sport' }]
    });
    
    if (!match) {
      return res.status(404).json({ 
        error: { message: 'Partido no encontrado' } 
      });
    }
    
    if (match.status === 'finished') {
      return res.status(400).json({
        error: { message: 'Este partido ya ha sido cerrado' }
      });
    }
    
    // Update match result
    match.home_score = parseInt(home_score);
    match.away_score = parseInt(away_score);
    match.result_data = result_data || null;
    match.status = 'finished';
    match.predictions_locked = true;
    await match.save();
    
    // Process predictions for this match
    const PredictionService = require('../services/prediction.service');
    const processResult = await PredictionService.processPredictions(matchId);
    
    res.json({
      message: 'Resultado registrado y predicciones procesadas exitosamente',
      data: { 
        match,
        predictions_processed: processResult
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get predictions for a match (Admin)
exports.getMatchPredictions = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        error: { message: 'Partido no encontrado' }
      });
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: predictions } = await Prediction.findAndCountAll({
      where: { match_id: matchId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'avatar', 'total_points']
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
      total_points_awarded: predictions.reduce((sum, p) => sum + (p.points_earned || 0), 0)
    };
    
    res.json({
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
    next(error);
  }
};
