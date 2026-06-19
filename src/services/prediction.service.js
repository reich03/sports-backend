const { Prediction, User, Match, Notification, Sport } = require('../models');
const sequelize = require('../config/database');
const ScoringService = require('./scoring.service');

class PredictionService {
  // Process predictions after match result is submitted
  static async processPredictions(matchId) {
    const transaction = await sequelize.transaction();
    
    try {
      const match = await Match.findByPk(matchId, {
        include: [{ model: Sport, as: 'sport' }]
      });
      
      if (!match) throw new Error('Match not found');
      
      if (match.status !== 'finished') {
        throw new Error('Match must be finished before processing predictions');
      }
      
      if (match.home_score === null || match.away_score === null) {
        throw new Error('Match scores must be set before processing predictions');
      }
      
      // Solo predicciones generales (sin torneo) — las de torneo se procesan por TournamentService
      const predictions = await Prediction.findAll({
        where: { match_id: matchId, is_processed: false, tournament_id: null }
      });
      
      let processedCount = 0;
      
      for (const prediction of predictions) {
        let points = 0;
        let isCorrect = false;
        
        // Calculate points based on sport type
        const sport = match.sport;
        const predictionType = sport?.prediction_type || 'score';
        
        if (predictionType === 'score') {
          const result = ScoringService.calculateScorePoints(
            prediction.prediction_data,
            match,
            sport?.scoring_rules || ScoringService.getDefaultScoreRules()
          );
          points = result.points;
          isCorrect = result.isCorrect;
        } else if (predictionType === 'positions') {
          const result = this.calculatePositionBasedPoints(
            prediction,
            match,
            sport?.scoring_rules || {}
          );
          points = result.points;
          isCorrect = result.isCorrect;
        }
        
        // Update prediction
        prediction.points_earned = points;
        prediction.is_correct = isCorrect;
        prediction.is_processed = true;
        await prediction.save({ transaction });
        
        // Update user stats — siempre sumar puntos ganados
        if (points > 0) {
          await User.increment(
            { total_points: points },
            { where: { id: prediction.user_id }, transaction }
          );
        }
        if (isCorrect) {
          await User.increment(
            { correct_predictions: 1 },
            { where: { id: prediction.user_id }, transaction }
          );
        }
        
        // Create notification with detailed message
        let notificationMessage;
        if (points === 0) {
          notificationMessage = 'Tu predicción ha sido procesada. Esta vez no sumaste puntos.';
        } else if (isCorrect && points >= 5) {
          notificationMessage = `¡Marcador exacto! Has ganado ${points} puntos.`;
        } else if (isCorrect && points >= 3) {
          notificationMessage = `¡Acertaste el resultado! Has ganado ${points} puntos.`;
        } else if (isCorrect && points > 0) {
          notificationMessage = `¡Acertaste parcialmente! Has ganado ${points} punto(s).`;
        } else {
          notificationMessage = `Has ganado ${points} punto(s) en tu predicción.`;
        }
        
        try {
          await Notification.create({
            user_id: prediction.user_id,
            type: 'prediction',
            title: points > 0 ? '¡Predicción procesada!' : 'Predicción procesada',
            message: notificationMessage,
            data: {
              match_id: matchId,
              prediction_id: prediction.id,
              points_earned: points,
              is_correct: isCorrect
            }
          }, { transaction });
        } catch (notifErr) {
          console.error('Error creando notificación de predicción:', notifErr.message);
        }
        
        processedCount++;
      }
      
      await transaction.commit();
      return { 
        processed: processedCount,
        total: predictions.length
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Delegado al motor unificado MASTERSPORTS
  static calculateScoreBasedPoints(prediction, match, scoringRules) {
    return ScoringService.calculateScorePoints(
      prediction.prediction_data,
      match,
      scoringRules
    );
  }

  // Calculate points for position-based sports (F1)
  static calculatePositionBasedPoints(prediction, match, scoringRules) {
    let points = 0;
    let isCorrect = false;
    
    const {
      exact_podium = 10,
      correct_position = 3,
      in_podium = 1,
      pole_position = 2
    } = scoringRules;
    
    const predData = prediction.prediction_data;
    const actualData = match.result_data;
    
    if (!predData || !actualData) {
      return { points: 0, isCorrect: false };
    }
    
    // Check pole position
    if (predData.pole_position === actualData.pole_position) {
      points += pole_position;
      isCorrect = true;
    }
    
    // Check podium
    const predPodium = predData.podium || [];
    const actualPodium = actualData.positions ? actualData.positions.slice(0, 3) : [];
    
    // Exact podium order
    if (JSON.stringify(predPodium) === JSON.stringify(actualPodium)) {
      points += exact_podium;
      isCorrect = true;
    } else {
      // Points for correct positions or just being in podium
      predPodium.forEach((teamId, index) => {
        if (actualPodium[index] === teamId) {
          points += correct_position;
          isCorrect = true;
        } else if (actualPodium.includes(teamId)) {
          points += in_podium;
          isCorrect = true;
        }
      });
    }
    
    return { points, isCorrect };
  }
}

module.exports = PredictionService;
