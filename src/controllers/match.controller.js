const { Match, League, Sport, Team, Prediction } = require('../models');
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
    const { sport_id, league_id, limit = 10 } = req.query;
    const where = {
      match_date: { [Op.gte]: new Date() },
      status: 'scheduled'
    };
    
    if (sport_id) where.sport_id = sport_id;
    if (league_id) where.league_id = league_id;
    
    const matches = await Match.findAll({
      where,
      include: [
        { model: Sport, as: 'sport' },
        { model: League, as: 'league' },
        { model: Team, as: 'home_team' },
        { model: Team, as: 'away_team' }
      ],
      order: [['match_date', 'ASC']],
      limit: parseInt(limit)
    });
    
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
      home_team_id,
      away_team_id,
      match_date,
      location,
      round
    } = req.body;
    
    const match = await Match.create({
      league_id,
      sport_id,
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

// Submit match result (Admin)
exports.submitMatchResult = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { home_score, away_score, result_data } = req.body;
    
    const match = await Match.findByPk(matchId, {
      include: [{ model: Sport, as: 'sport' }]
    });
    
    if (!match) {
      return res.status(404).json({ 
        error: { message: 'Partido no encontrado' } 
      });
    }
    
    // Update match result
    match.home_score = home_score;
    match.away_score = away_score;
    match.result_data = result_data;
    match.status = 'finished';
    match.predictions_locked = true;
    await match.save();
    
    // Process predictions for this match
    const PredictionService = require('../services/prediction.service');
    await PredictionService.processPredictions(matchId, match.sport);
    
    res.json({
      message: 'Resultado registrado y predicciones procesadas',
      data: { match }
    });
  } catch (error) {
    next(error);
  }
};
