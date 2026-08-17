// middlewares/auth.middleware.js
import { User } from '../db/models/usermodel.js';
import jwt from 'jsonwebtoken';

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../db/models/usermodel.js';
import jwt from 'jsonwebtoken';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        isVerified: true,
        provider: 'google'
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id); 

    if (!user) return res.status(401).json({ message: "User not found" });
    
    req.user = user; 
    next();
  } catch (error) {
    next(error);
  }
};