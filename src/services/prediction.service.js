const { Prediction, User, Match, Notification } = require('../models');
const sequelize = require('../config/database');

class PredictionService {
  // Process predictions after match result is submitted
  static async processPredictions(matchId, sport) {
    const transaction = await sequelize.transaction();
    
    try {
      const match = await Match.findByPk(matchId);
      if (!match) throw new Error('Match not found');
      
      const predictions = await Prediction.findAll({
        where: { match_id: matchId, is_processed: false }
      });
      
      for (const prediction of predictions) {
        let points = 0;
        
        // Calculate points based on sport type
        if (sport.prediction_type === 'score') {
          points = this.calculateScoreBasedPoints(
            prediction,
            match,
            sport.scoring_rules
          );
        } else if (sport.prediction_type === 'positions') {
          points = this.calculatePositionBasedPoints(
            prediction,
            match,
            sport.scoring_rules
          );
        }
        
        // Update prediction
        prediction.points_earned = points;
        prediction.is_processed = true;
        prediction.processed_at = new Date();
        await prediction.save({ transaction });
        
        // Update user stats
        await User.increment(
          {
            total_points: points,
            correct_predictions: points > 0 ? 1 : 0
          },
          {
            where: { id: prediction.user_id },
            transaction
          }
        );
        
        // Create notification
        await Notification.create({
          user_id: prediction.user_id,
          type: 'prediction_points',
          title: 'Predicción procesada',
          message: `Has ganado ${points} puntos por tu predicción`,
          data: {
            match_id: matchId,
            prediction_id: prediction.id,
            points
          }
        }, { transaction });
      }
      
      await transaction.commit();
      return { processed: predictions.length };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  // Calculate points for score-based sports (football, basketball)
  static calculateScoreBasedPoints(prediction, match, scoringRules) {
    let points = 0;
    
    const {
      exact_score = 5,
      correct_winner = 3,
      correct_draw = 3,
      exact_difference = 2
    } = scoringRules;
    
    const predHome = prediction.home_score;
    const predAway = prediction.away_score;
    const actualHome = match.home_score;
    const actualAway = match.away_score;
    
    // Exact score
    if (predHome === actualHome && predAway === actualAway) {
      points = exact_score;
    }
    // Correct winner/draw
    else {
      const predResult = predHome > predAway ? 'home' : (predHome < predAway ? 'away' : 'draw');
      const actualResult = actualHome > actualAway ? 'home' : (actualHome < actualAway ? 'away' : 'draw');
      
      if (predResult === actualResult) {
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
      }
    }
    
    return points;
  }
  
  // Calculate points for position-based sports (F1)
  static calculatePositionBasedPoints(prediction, match, scoringRules) {
    let points = 0;
    
    const {
      exact_podium = 10,
      correct_position = 3,
      in_podium = 1,
      pole_position = 2
    } = scoringRules;
    
    const predData = prediction.prediction_data;
    const actualData = match.result_data;
    
    if (!predData || !actualData) return 0;
    
    // Check pole position
    if (predData.pole_position === actualData.pole_position) {
      points += pole_position;
    }
    
    // Check podium
    const predPodium = predData.podium || [];
    const actualPodium = actualData.positions ? actualData.positions.slice(0, 3) : [];
    
    // Exact podium order
    if (JSON.stringify(predPodium) === JSON.stringify(actualPodium)) {
      points += exact_podium;
    } else {
      // Points for correct positions or just being in podium
      predPodium.forEach((teamId, index) => {
        if (actualPodium[index] === teamId) {
          points += correct_position;
        } else if (actualPodium.includes(teamId)) {
          points += in_podium;
        }
      });
    }
    
    return points;
  }
}

module.exports = PredictionService;
