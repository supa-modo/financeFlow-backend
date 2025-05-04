import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { generateToken } from '../config/jwt';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { sendPasswordResetEmail } from '../utils/email';

// Create and send JWT token
export const createSendToken = (user: User, statusCode: number, res: Response) => {
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

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Configure cookie options for cross-domain support in production
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    // In production, don't specify domain to let browser set it automatically
    // This helps with cross-domain issues
  };

  // Set JWT as cookie
  res.cookie('jwt', token, cookieOptions);

  // Always include token in response body for production fallback
  res.status(statusCode).json({
    status: 'success',
    token, // Include token in response for production fallback
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
  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Configure cookie options to match the ones used when setting the cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000), // Short expiration
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
  };
  
  // Clear the JWT cookie
  res.cookie('jwt', 'loggedout', cookieOptions);
  
  // Log the logout action
  console.log('User logged out successfully');

  res.status(200).json({ 
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Get current user
export const getCurrentUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user from request (set by protect middleware)
  const user = req.user as User;

  if (!user) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

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

  // Check if passwords are provided
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Please provide current password and new password', 400));
  }

  // Check if new passwords match
  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('New passwords do not match', 400));
  }

  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to update your password', 401));
  }

  // Get user from database with fresh data
  const userId = (req.user as User).id;
  const user = await User.findByPk(userId);
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

  // Check if name and email are provided
  if (!name || !email) {
    return next(new AppError('Please provide both name and email', 400));
  }

  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to update your profile', 401));
  }

  // Get user from database
  const userId = (req.user as User).id;
  const user = await User.findByPk(userId);
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

  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to update notification settings', 401));
  }

  // Get user from database
  const userId = (req.user as User).id;
  const user = await User.findByPk(userId);
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

// Forgot password - send reset token via email
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return next(new AppError('Please provide your email address', 400));
  }

  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Return error if user doesn't exist
    return next(new AppError('No user found with that email address', 404));
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  
  // Save the reset token and expiration to the database
  // Force save to ensure the token is saved even if other validations might fail
  await user.save({ validate: false });
  
  // Log token creation for debugging
  console.log(`Password reset token created for ${email}: ${resetToken}`);
  console.log(`Token expires at: ${user.password_reset_expires}`);

  try {
    // Create reset URL based on environment
    let clientResetUrl;
    
    if (process.env.NODE_ENV === 'development') {
      clientResetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    } else {
      // Make sure CLIENT_URL is properly set
      if (!process.env.CLIENT_URL) {
        console.warn('CLIENT_URL environment variable is not set. Using default URL.');
      }
      clientResetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    }
    
    console.log(`Reset URL created: ${clientResetUrl}`);

    // Send email with reset token
    await sendPasswordResetEmail(user.email, resetToken, clientResetUrl);
    console.log('Password reset email sent successfully');

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email.'
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    // If there's an error sending the email, clear the reset token
    user.clearPasswordResetToken();
    await user.save({ validate: false });

    return next(new AppError('There was an error sending the password reset email. Please try again later.', 500));
  }
});

// Reset password using token
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  // Check if password and passwordConfirm are provided
  if (!password || !passwordConfirm) {
    return next(new AppError('Please provide password and password confirmation', 400));
  }

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Hash the token to compare with the one in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user by reset token and check if token is still valid
  const user = await User.findOne({
    where: {
      password_reset_token: hashedToken,
      password_reset_expires: { [Op.gt]: new Date() } // Token must not be expired
    }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Update password
  user.password = password;
  user.clearPasswordResetToken(); // Clear reset token fields
  await user.save();

  // Log the user in by sending a JWT token
  createSendToken(user, 200, res);
});
