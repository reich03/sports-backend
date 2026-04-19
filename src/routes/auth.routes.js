const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const passport = require('passport');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

const verifyOTPValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Código OTP inválido')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido')
];

const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Código OTP inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

// Routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/verify-otp', verifyOTPValidation, validate, authController.verifyOTP);
router.post('/resend-otp', forgotPasswordValidation, validate, authController.resendOTP);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);
router.post('/change-password', authenticateJWT, changePasswordValidation, validate, authController.changePassword);
router.get('/me', authenticateJWT, authController.getCurrentUser);
router.post('/logout', authenticateJWT, authController.logout);

// OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.oauthCallback
);

module.exports = router;
