import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './appError';

// Validation schemas
export const authSchemas = {
  // Registration schema
  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    passwordConfirm: z.string()
  }).refine(data => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm']
  }),

  // Login schema
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  }),

  // Update password schema
  updatePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    newPasswordConfirm: z.string()
  }).refine(data => data.newPassword === data.newPasswordConfirm, {
    message: 'New passwords do not match',
    path: ['newPasswordConfirm']
  })
};

// Middleware factory for validating request body
export const validateRequest = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return next(new AppError(`Validation error: ${errorMessages[0].message}`, 400));
      }
      
      next(error);
    }
  };
};
