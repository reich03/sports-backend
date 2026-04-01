const { Prediction, Match, User, Sport } = require('../models');
const { Op } = require('sequelize');

// Create prediction
exports.createPrediction = async (req, res, next) => {
  try {
    const { match_id, home_score, away_score, prediction_data } = req.body;
    
    const match = await Match.findByPk(match_id);
    
    if (!match) {
      return res.status(404).json({ 
        error: { message: 'Partido no encontrado' } 
      });
    }
    
    // Check if predictions are locked
    if (match.predictions_locked || (match.lock_date && new Date() > match.lock_date)) {
      return res.status(400).json({ 
        error: { message: 'Las predicciones para este partido ya están cerradas' } 
      });
    }
    
    // Check if user already has a prediction for this match
    const existingPrediction = await Prediction.findOne({
      where: {
        user_id: req.user.id,
        match_id
      }
    });
    
    if (existingPrediction) {
      return res.status(400).json({ 
        error: { message: 'Ya tienes una predicción para este partido' } 
      });
    }
    
    const prediction = await Prediction.create({
      user_id: req.user.id,
      match_id,
      home_score,
      away_score,
      prediction_data
    });
    
    // Update user's total predictions
    await User.increment('total_predictions', { where: { id: req.user.id } });
    
    res.status(201).json({
      message: 'Predicción creada exitosamente',
      data: { prediction }
    });
  } catch (error) {
    next(error);
  }
};

// Get my predictions
exports.getMyPredictions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { user_id: req.user.id };
    
    const includeWhere = {};
    if (status) includeWhere.status = status;
    
    const { count, rows: predictions } = await Prediction.findAndCountAll({
      where,
      include: [
        {
          model: Match,
          as: 'match',
          where: includeWhere,
          include: ['home_team', 'away_team', 'league', 'sport']
        }
      ],
      order: [[{ model: Match, as: 'match' }, 'match_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      data: {
        predictions,
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

// Get predictions by match
exports.getPredictionsByMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    
    const match = await Match.findByPk(matchId);
    
    if (!match) {
      return res.status(404).json({ 
        error: { message: 'Partido no encontrado' } 
      });
    }
    
    // Only show predictions after match is finished or locked
    if (!match.predictions_locked && match.status !== 'finished') {
      return res.status(403).json({ 
        error: { message: 'Las predicciones no son visibles aún' } 
      });
    }
    
    const predictions = await Prediction.findAll({
      where: { match_id: matchId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['points_earned', 'DESC'], ['created_at', 'ASC']]
    });
    
    res.json({
      data: { predictions }
    });
  } catch (error) {
    next(error);
  }
};

// Update prediction
exports.updatePrediction = async (req, res, next) => {
  try {
    const { predictionId } = req.params;
    const { home_score, away_score, prediction_data } = req.body;
    
    const prediction = await Prediction.findByPk(predictionId, {
      include: [{ model: Match, as: 'match' }]
    });
    
    if (!prediction) {
      return res.status(404).json({ 
        error: { message: 'Predicción no encontrada' } 
      });
    }
    
    // Check ownership
    if (prediction.user_id !== req.user.id) {
      return res.status(403).json({ 
        error: { message: 'No tienes permiso para editar esta predicción' } 
      });
    }
    
    // Check if predictions are locked
    if (prediction.match.predictions_locked || 
        (prediction.match.lock_date && new Date() > prediction.match.lock_date)) {
      return res.status(400).json({ 
        error: { message: 'Las predicciones para este partido ya están cerradas' } 
      });
    }
    
    if (home_score !== undefined) prediction.home_score = home_score;
    if (away_score !== undefined) prediction.away_score = away_score;
    if (prediction_data !== undefined) prediction.prediction_data = prediction_data;
    
    await prediction.save();
    
    res.json({
      message: 'Predicción actualizada exitosamente',
      data: { prediction }
    });
  } catch (error) {
    next(error);
  }
};
