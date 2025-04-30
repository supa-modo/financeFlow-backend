import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './appError';
import { FinancialSourceType } from '../models/financialSource.model';

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

// Financial source schemas
export const financialSourceSchemas = {
  // Create financial source schema
  create: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    type: z.nativeEnum(FinancialSourceType, {
      errorMap: () => ({ message: 'Invalid financial source type' })
    }),
    description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
    colorCode: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color code format (must be #RRGGBB)').optional().nullable(),
    initialBalance: z.number().nonnegative('Balance must be a non-negative number').optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable()
  }),

  // Update financial source schema
  update: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
    type: z.nativeEnum(FinancialSourceType, {
      errorMap: () => ({ message: 'Invalid financial source type' })
    }).optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
    colorCode: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color code format (must be #RRGGBB)').optional().nullable(),
    isActive: z.boolean().optional()
  }),

  // Delete financial source schema (empty, just for consistency)
  delete: z.object({})
};

// Financial source update schemas
export const financialSourceUpdateSchemas = {
  // Create update schema
  create: z.object({
    balance: z.number().nonnegative('Balance must be a non-negative number'),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
  }),

  // Update update schema
  update: z.object({
    balance: z.number().nonnegative('Balance must be a non-negative number').optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
  }),

  // Delete update schema (empty, just for consistency)
  delete: z.object({})
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
