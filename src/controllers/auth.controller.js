const { User } = require('../models');
const { Op } = require('sequelize');
const { generateToken } = require('../utils/jwt.util');
const { generateOTP, generateResetToken } = require('../utils/generators.util');
const { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email.util');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          error: { message: 'El email ya está registrado' } 
        });
      }
      return res.status(400).json({ 
        error: { message: 'El nombre de usuario ya está en uso' } 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create user
    const user = await User.create({
      email,
      username,
      password,
      otp_code: otp,
      otp_expires: otpExpires
    });
    
    // Send OTP email
    await sendOTPEmail(email, otp, username);
    
    res.status(201).json({
      message: 'Usuario registrado. Por favor verifica tu email.',
      data: {
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ 
        error: { message: 'El email ya está verificado' } 
      });
    }
    
    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(400).json({ 
        error: { message: 'Código OTP inválido' } 
      });
    }
    
    if (user.otp_expires < new Date()) {
      return res.status(400).json({ 
        error: { message: 'El código OTP ha expirado' } 
      });
    }
    
    // Verify email
    user.email_verified = true;
    user.otp_code = null;
    user.otp_expires = null;
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      message: 'Email verificado exitosamente',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }
    
    if (user.email_verified) {
      return res.status(400).json({ 
        error: { message: 'El email ya está verificado' } 
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    user.otp_code = otp;
    user.otp_expires = otpExpires;
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp, user.username);
    
    res.json({
      message: 'Código OTP reenviado'
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ 
        error: { message: 'Credenciales inválidas' } 
      });
    }
    
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: { message: 'Por favor verifica tu email primero' } 
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: { message: 'Credenciales inválidas' } 
      });
    }
    
    // Update last login
    user.last_login = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      message: 'Login exitoso',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        message: 'Si el email existe, recibirás un código para restablecer tu contraseña'
      });
    }
    
    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    user.otp_code = otp;
    user.otp_expires = otpExpires;
    await user.save();
    
    // Send reset email with OTP
    await sendPasswordResetEmail(email, otp, user.username);
    
    res.json({
      message: 'Si el email existe, recibirás un código para restablecer tu contraseña'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'Usuario no encontrado' } 
      });
    }
    
    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(400).json({ 
        error: { message: 'Código OTP inválido' } 
      });
    }
    
    if (user.otp_expires < new Date()) {
      return res.status(400).json({ 
        error: { message: 'El código OTP ha expirado' } 
      });
    }
    
    // Update password
    user.password = password;
    user.otp_code = null;
    user.otp_expires = null;
    await user.save();
    
    res.json({
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password (for authenticated users)
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        error: { message: 'Usuario no encontrado' }
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: { message: 'La contraseña actual es incorrecta' }
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Logout (client-side token removal)
exports.logout = async (req, res, next) => {
  try {
    res.json({
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
};

// OAuth callback handler
exports.oauthCallback = async (req, res, next) => {
  try {
    const token = generateToken(req.user.id);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};
