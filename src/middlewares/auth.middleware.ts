import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken, JwtUserPayload } from '../config/jwt';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to protect routes that require authentication
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Get token from authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    // Verify token
    const decoded = verifyToken(token) as JwtUserPayload;

    // Check if user still exists
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Set user on request
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
});

// Middleware to check if user is logged in (for rendered pages)
export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.cookies.jwt) {
      // Verify token
      const decoded = verifyToken(req.cookies.jwt) as JwtUserPayload;

      // Check if user still exists
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return next();
      }

      // Set user on request
      req.user = user;
    }
  } catch (error) {
    // Do nothing, just continue
  }
  
  next();
};
