import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { generateToken } from '../config/jwt';

// Import the createSendToken function from auth.controller
import { createSendToken } from './auth.controller';

// Initiate Google OAuth login
export const googleLogin = (req: Request, res: Response, next: NextFunction) => {
  // Instead of directly redirecting, send the URL to the client
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${encodeURIComponent(`${process.env.SERVER_URL}/api/v1/auth/google/callback`)}&scope=${encodeURIComponent('profile email')}&client_id=${process.env.GOOGLE_CLIENT_ID}`;
  
  // Return the URL to the client
  res.status(200).json({
    status: 'success',
    redirectUrl: googleAuthUrl
  });
};

// Handle Google OAuth callback
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google authentication error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/oauth-failure?error=${encodeURIComponent(err.message)}`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/oauth-failure?error=Authentication failed`);
    }
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    // Redirect to client with token
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  })(req, res, next);
};

// Handle OAuth success - redirect to frontend with token
export const oauthSuccess = (req: Request, res: Response) => {
  // Get the frontend URL from environment variables
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  // Redirect to frontend with success message
  res.redirect(`${frontendUrl}/oauth-success`);
};

// Handle OAuth failure - redirect to frontend with error
export const oauthFailure = (req: Request, res: Response) => {
  // Get the frontend URL from environment variables
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  // Redirect to frontend with error message
  res.redirect(`${frontendUrl}/oauth-failure`);
};
