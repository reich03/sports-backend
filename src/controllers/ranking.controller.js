const { User, Sport, League } = require('../models');
const { Op } = require('sequelize');

exports.getGlobalRanking = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const users = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'total_points', 'total_predictions', 'correct_predictions'],
      where: {
        is_active: true,
        total_predictions: { [Op.gt]: 0 }
      },
      order: [['total_points', 'DESC'], ['correct_predictions', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({ data: { ranking: users } });
  } catch (error) {
    next(error);
  }
};

exports.getRankingBySport = async (req, res, next) => {
  try {
    // TODO: Implement sport-specific ranking
    // This would require tracking points per sport
    res.json({ data: { ranking: [] } });
  } catch (error) {
    next(error);
  }
};

exports.getRankingByLeague = async (req, res, next) => {
  try {
    // TODO: Implement league-specific ranking
    // This would require tracking points per league
    res.json({ data: { ranking: [] } });
  } catch (error) {
    next(error);
  }
};
