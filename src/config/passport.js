const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy (solo si está configurado)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await User.findOne({ where: { google_id: profile.id } });
        
        if (!user) {
          // Check if user exists with this email
          user = await User.findOne({ where: { email: profile.emails[0].value } });
          
          if (user) {
            // Link Google account to existing user
            user.google_id = profile.id;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              email: profile.emails[0].value,
              username: profile.displayName || profile.emails[0].value.split('@')[0],
              google_id: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              email_verified: true,
              auth_provider: 'google'
            });
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  ));
}

module.exports = passport;
