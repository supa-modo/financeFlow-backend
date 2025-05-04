import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import crypto from 'crypto';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({
          where: { provider: 'google', provider_id: profile.id }
        });

        // If user exists, return the user
        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        if (email) {
          user = await User.findOne({ where: { email } });
          
          // If user exists with this email, update their account with Google info
          if (user) {
            user.provider = 'google';
            user.provider_id = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // Create a new user if one doesn't exist
        if (email) {
          // Generate a random password for the user
          const password = crypto.randomBytes(20).toString('hex');
          
          // Create new user
          const newUser = await User.create({
            name: profile.displayName || 'Google User',
            email,
            password,
            provider: 'google',
            provider_id: profile.id
          });

          return done(null, newUser);
        }

        // If no email is available, we can't create a user
        return done(new Error('No email found in Google profile'), undefined);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
