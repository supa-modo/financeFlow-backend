import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateToken } from '../config/jwt';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

// Create and send JWT token
const createSendToken = (user: User, statusCode: number, res: Response) => {
  const token = generateToken(user.id);
  const cookieExpiresIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10);

  // Remove password from output
  const userWithoutPassword = {
    id: user.id,
    name: user.name,
    email: user.email,
    notification_settings: user.notification_settings,
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  // Set JWT as cookie
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userWithoutPassword
    }
  });
};

// Register new user
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password
  });

  // Send token to client
  createSendToken(newUser, 201, res);
});

// Login user
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists & password is correct
  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Send token to client
  createSendToken(user, 200, res);
});

// Logout user
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

// Get current user
export const getCurrentUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user from request (set by protect middleware)
  const user = req.user;

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update password
export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  
  // Check if all required fields are provided
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Please provide all password fields', 400));
  }
  
  // Check if new passwords match
  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('New passwords do not match', 400));
  }

  // Get user from database with fresh data
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if current password is correct
  const isPasswordCorrect = await user.correctPassword(currentPassword);
  if (!isPasswordCorrect) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // Update password
  await user.changePassword(newPassword);
  
  // Reload user to get updated data
  await user.reload();

  // Send token to client
  createSendToken(user, 200, res);
});

// Update user profile
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email } = req.body;
  
  // Check if email and name are provided
  if (!email || !name) {
    return next(new AppError('Please provide both name and email', 400));
  }

  // Get user from database
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check if email is already taken (if changing email)
  if (email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email is already in use', 400));
    }
  }

  // Update user profile
  user.name = name;
  user.email = email;
  await user.save();

  // Send updated user data
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        notification_settings: user.notification_settings,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }
  });
});

// Update notification settings
export const updateNotificationSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { notification_settings } = req.body;
  
  // Check if notification settings are provided
  if (!notification_settings) {
    return next(new AppError('Please provide notification settings', 400));
  }

  // Get user from database
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update notification settings
  user.notification_settings = notification_settings;
  await user.save();

  // Send updated user data
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        notification_settings: user.notification_settings,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }
  });
});
