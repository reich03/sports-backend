const { Prediction, User, Match, Notification, Sport } = require('../models');
const sequelize = require('../config/database');

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
      
      const predictions = await Prediction.findAll({
        where: { match_id: matchId, is_processed: false }
      });
      
      let processedCount = 0;
      
      for (const prediction of predictions) {
        let points = 0;
        let isCorrect = false;
        
        // Calculate points based on sport type
        const sport = match.sport;
        const predictionType = sport?.prediction_type || 'score';
        
        if (predictionType === 'score') {
          const result = this.calculateScoreBasedPoints(
            prediction,
            match,
            sport?.scoring_rules || {}
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
        
        // Update user stats
        if (isCorrect) {
          await User.increment(
            {
              total_points: points,
              correct_predictions: 1
            },
            {
              where: { id: prediction.user_id },
              transaction
            }
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
  
  // Calculate points for score-based sports (football, basketball)
  static calculateScoreBasedPoints(prediction, match, scoringRules) {
    let points = 0;
    let isCorrect = false;
    
    const {
      exact_score = 5,
      correct_winner = 3,
      correct_draw = 3,
      exact_difference = 2,
      one_score_correct = 1
    } = scoringRules;
    
    const predData = prediction.prediction_data || {};
    const predHome = predData.home_score;
    const predAway = predData.away_score;
    const actualHome = match.home_score;
    const actualAway = match.away_score;
    
    if (predHome === undefined || predAway === undefined) {
      return { points: 0, isCorrect: false };
    }
    
    // Exact score (máxima puntuación - ya incluye todo)
    if (predHome === actualHome && predAway === actualAway) {
      points = exact_score;
      isCorrect = true;
    }
    // No es marcador exacto, evaluar otros casos
    else {
      const predResult = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
      const actualResult = actualHome > actualAway ? 'home' : (actualHome < actualAway ? 'away' : 'draw');
      
      // Acertó el resultado (ganador o empate)
      if (predResult === actualResult) {
        isCorrect = true;
        
        if (actualResult === 'draw') {
          points = correct_draw;
        } else {
          points = correct_winner;
          
          // Bonus for exact goal difference
          const predDiff = Math.abs(predHome - predAway);
          const actualDiff = Math.abs(actualHome - actualAway);
          if (predDiff === actualDiff) {
            points += exact_difference;
          }
        }
        
        // NUEVO: Además de acertar el resultado, verificar marcadores individuales
        // Solo si no es marcador exacto (ya manejado arriba)
        if (predHome === actualHome) {
          points += one_score_correct;
        }
        if (predAway === actualAway) {
          points += one_score_correct;
        }
      }
      // No acertó el resultado, pero verificar marcadores individuales
      else {
        let scoredSomething = false;
        
        // Acertó marcador del local
        if (predHome === actualHome) {
          points += one_score_correct;
          scoredSomething = true;
        }
        
        // Acertó marcador del visitante
        if (predAway === actualAway) {
          points += one_score_correct;
          scoredSomething = true;
        }
        
        if (scoredSomething) {
          isCorrect = true;
        }
      }
    }
    
    return { points, isCorrect };
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
