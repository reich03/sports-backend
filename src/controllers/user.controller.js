const { User, Prediction, Match } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, role, isActive, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.is_active = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'otp_code', 'otp_expires', 'reset_password_token', 'reset_password_expires'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      data: {
        users,
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

// Create user (admin only)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, username, role = 'user', isActive = true } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: { message: 'Email y contraseña son requeridos' }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: { message: 'El email ya está registrado' }
      });
    }

    // Check username if provided
    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({
          error: { message: 'El nombre de usuario ya está en uso' }
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      role,
      is_active: isActive,
      is_verified: true // Admin created users are auto-verified
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: { message: 'Usuario no encontrado' }
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        error: { message: 'No puedes eliminar otros administradores' }
      });
    }

    await user.destroy();

    res.json({
      message: 'Usuario eliminado exitosamente',
      data: { userId }
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        error: { message: 'Rol inválido. Debe ser "user" o "admin"' }
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: { message: 'Usuario no encontrado' }
      });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Rol actualizado exitosamente',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    next(error);
  }
};

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
    const { username, email, avatar, bio } = req.body;
    
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
    
    // Check if email is taken
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ 
          error: { message: 'El email ya está en uso' } 
        });
      }
      user.email = email;
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

// Upload user avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Verificar que el usuario existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ 
        error: { message: 'No tienes permisos para actualizar este usuario' } 
      });
    }

    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ 
        error: { message: 'No se ha proporcionado ninguna imagen' } 
      });
    }

    // Eliminar avatar anterior si existe
    if (user.avatar && user.avatar.includes('/uploads/avatars/')) {
      const fs = require('fs');
      const path = require('path');
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Actualizar URL del avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar actualizado exitosamente',
      data: {
        avatar: avatarUrl,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user avatar
exports.deleteAvatar = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ 
        error: { message: 'No tienes permisos para actualizar este usuario' } 
      });
    }

    // Eliminar archivo físico si existe
    if (user.avatar && user.avatar.includes('/uploads/avatars/')) {
      const fs = require('fs');
      const path = require('path');
      const avatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Actualizar usuario
    user.avatar = null;
    await user.save();

    res.json({
      message: 'Avatar eliminado exitosamente',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};
