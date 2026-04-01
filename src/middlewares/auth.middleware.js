const passport = require('passport');

// Middleware to authenticate user with JWT
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: { message: 'Unauthorized: Invalid or expired token' } 
      });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ 
        error: { message: 'Account is inactive' } 
      });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

module.exports = {
  authenticateJWT,
  optionalAuth
};
