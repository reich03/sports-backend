const { User, Prediction, Match } = require('../models');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'otp_code', 'otp_expires', 'reset_password_token', 'reset_password_expires'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }
    
    res.json({
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, avatar, bio } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }
    
    // Check if username is taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ 
          error: { message: 'El nombre de usuario ya está en uso' } 
        });
      }
      user.username = username;
    }
    
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    next(error);
  }
};

// Get user predictions
exports.getUserPredictions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: predictions } = await Prediction.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Match,
          as: 'match',
          include: ['home_team', 'away_team', 'league', 'sport']
        }
      ],
      order: [['created_at', 'DESC']],
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

// Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }
    
    const totalPredictions = await Prediction.count({
      where: { user_id: userId }
    });
    
    const processedPredictions = await Prediction.count({
      where: { user_id: userId, is_processed: true }
    });
    
    const correctPredictions = await Prediction.count({
      where: { 
        user_id: userId,
        is_processed: true,
        points_earned: { $gt: 0 }
      }
    });
    
    const totalPoints = await Prediction.sum('points_earned', {
      where: { user_id: userId }
    });
    
    const accuracy = processedPredictions > 0 
      ? ((correctPredictions / processedPredictions) * 100).toFixed(2)
      : 0;
    
    res.json({
      data: {
        stats: {
          total_predictions: totalPredictions,
          processed_predictions: processedPredictions,
          correct_predictions: correctPredictions,
          total_points: totalPoints || 0,
          accuracy: parseFloat(accuracy)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
