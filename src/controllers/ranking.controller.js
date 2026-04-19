const { User, Sport, League, Prediction, Match, Round, sequelize } = require('../models');
const { Op } = require('sequelize');

// Ranking Global
exports.getGlobalRanking = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const users = await User.findAll({
      attributes: [
        'id', 
        'username', 
        'avatar', 
        'total_points', 
        'total_predictions', 
        'correct_predictions'
      ],
      where: {
        is_active: true,
        total_predictions: { [Op.gt]: 0 }
      },
      order: [
        ['total_points', 'DESC'], 
        ['correct_predictions', 'DESC'],
        ['total_predictions', 'ASC']
      ],
      limit: parseInt(limit)
    });
    
    const rankings = users.map((user, index) => ({
      position: index + 1,
      User: user,
      total_points: user.total_points,
      total_predictions: user.total_predictions,
      correct_predictions: user.correct_predictions,
      effectiveness: user.total_predictions > 0 
        ? Math.round((user.correct_predictions / user.total_predictions) * 100) 
        : 0
    }));
    
    res.json({ data: { rankings } });
  } catch (error) {
    next(error);
  }
};

// Ranking por Deporte
exports.getRankingBySport = async (req, res, next) => {
  try {
    const { sport_id, limit = 100 } = req.query;
    
    if (!sport_id) {
      return res.status(400).json({ 
        error: { message: 'sport_id es requerido' } 
      });
    }

    // Query SQL para calcular puntos por deporte
    const rankings = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        COALESCE(SUM(p.points_earned), 0) as total_points,
        COUNT(p.id) as total_predictions,
        COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
        CASE 
          WHEN COUNT(p.id) > 0 
          THEN ROUND((COUNT(CASE WHEN p.is_correct = true THEN 1 END)::numeric / COUNT(p.id)::numeric) * 100)
          ELSE 0 
        END as effectiveness
      FROM users u
      LEFT JOIN predictions p ON u.id = p.user_id
      LEFT JOIN matches m ON p.match_id = m.id
      WHERE u.is_active = true
        AND m.sport_id = :sport_id
        AND p.is_processed = true
      GROUP BY u.id, u.username, u.avatar
      HAVING COUNT(p.id) > 0
      ORDER BY total_points DESC, correct_predictions DESC, total_predictions ASC
      LIMIT :limit
    `, {
      replacements: { sport_id, limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    const formattedRankings = rankings.map((rank, index) => ({
      position: index + 1,
      User: {
        id: rank.id,
        username: rank.username,
        avatar: rank.avatar
      },
      total_points: parseInt(rank.total_points),
      total_predictions: parseInt(rank.total_predictions),
      correct_predictions: parseInt(rank.correct_predictions),
      effectiveness: parseInt(rank.effectiveness)
    }));
    
    res.json({ data: { rankings: formattedRankings } });
  } catch (error) {
    next(error);
  }
};

// Ranking por Liga
exports.getRankingByLeague = async (req, res, next) => {
  try {
    const { league_id, limit = 100 } = req.query;
    
    if (!league_id) {
      return res.status(400).json({ 
        error: { message: 'league_id es requerido' } 
      });
    }

    // Query SQL para calcular puntos por liga
    const rankings = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        COALESCE(SUM(p.points_earned), 0) as total_points,
        COUNT(p.id) as total_predictions,
        COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
        CASE 
          WHEN COUNT(p.id) > 0 
          THEN ROUND((COUNT(CASE WHEN p.is_correct = true THEN 1 END)::numeric / COUNT(p.id)::numeric) * 100)
          ELSE 0 
        END as effectiveness
      FROM users u
      LEFT JOIN predictions p ON u.id = p.user_id
      LEFT JOIN matches m ON p.match_id = m.id
      WHERE u.is_active = true
        AND m.league_id = :league_id
        AND p.is_processed = true
      GROUP BY u.id, u.username, u.avatar
      HAVING COUNT(p.id) > 0
      ORDER BY total_points DESC, correct_predictions DESC, total_predictions ASC
      LIMIT :limit
    `, {
      replacements: { league_id, limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    const formattedRankings = rankings.map((rank, index) => ({
      position: index + 1,
      User: {
        id: rank.id,
        username: rank.username,
        avatar: rank.avatar
      },
      total_points: parseInt(rank.total_points),
      total_predictions: parseInt(rank.total_predictions),
      correct_predictions: parseInt(rank.correct_predictions),
      effectiveness: parseInt(rank.effectiveness)
    }));
    
    res.json({ data: { rankings: formattedRankings } });
  } catch (error) {
    next(error);
  }
};

// Ranking por Jornada (Round)
exports.getRankingByRound = async (req, res, next) => {
  try {
    const { round_id, limit = 100 } = req.query;
    
    if (!round_id) {
      return res.status(400).json({ 
        error: { message: 'round_id es requerido' } 
      });
    }

    // Query SQL para calcular puntos por jornada
    const rankings = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.avatar,
        COALESCE(SUM(p.points_earned), 0) as total_points,
        COUNT(p.id) as total_predictions,
        COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
        CASE 
          WHEN COUNT(p.id) > 0 
          THEN ROUND((COUNT(CASE WHEN p.is_correct = true THEN 1 END)::numeric / COUNT(p.id)::numeric) * 100)
          ELSE 0 
        END as effectiveness
      FROM users u
      LEFT JOIN predictions p ON u.id = p.user_id
      LEFT JOIN matches m ON p.match_id = m.id
      WHERE u.is_active = true
        AND m.round_id = :round_id
        AND p.is_processed = true
      GROUP BY u.id, u.username, u.avatar
      HAVING COUNT(p.id) > 0
      ORDER BY total_points DESC, correct_predictions DESC, total_predictions ASC
      LIMIT :limit
    `, {
      replacements: { round_id, limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    const formattedRankings = rankings.map((rank, index) => ({
      position: index + 1,
      User: {
        id: rank.id,
        username: rank.username,
        avatar: rank.avatar
      },
      total_points: parseInt(rank.total_points),
      total_predictions: parseInt(rank.total_predictions),
      correct_predictions: parseInt(rank.correct_predictions),
      effectiveness: parseInt(rank.effectiveness)
    }));
    
    res.json({ data: { rankings: formattedRankings } });
  } catch (error) {
    next(error);
  }
};
