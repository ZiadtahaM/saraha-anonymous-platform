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
 
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
   
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
    const user = await User.findById(_id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});