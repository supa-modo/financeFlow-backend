import { Request, Response, NextFunction } from 'express';
import { FinancialSource, FinancialSourceUpdate, NetWorthEvent } from '../models/index';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { calculateNetWorth } from '../utils/financialUtils';
import { User } from '../types/custom';

// Get all updates for a financial source
export const getUpdates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to access financial source updates', 401));
  }
  
  const userId = (req.user as User).id;
  const { sourceId } = req.params;

  // Check if the financial source exists and belongs to the user
  const financialSource = await FinancialSource.findOne({
    where: { id: sourceId, user_id: userId }
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  // Get all updates for the financial source
  const updates = await FinancialSourceUpdate.findAll({
    where: { financial_source_id: sourceId },
    order: [['date', 'DESC'], ['created_at', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: updates.length,
    data: {
      updates
    }
  });
});

// Get a specific update
export const getUpdate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to access financial source updates', 401));
  }
  
  const userId = (req.user as User).id;
  const { sourceId, updateId } = req.params;

  // Check if the financial source exists and belongs to the user
  const financialSource = await FinancialSource.findOne({
    where: { id: sourceId, user_id: userId }
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  // Get the specific update
  const update = await FinancialSourceUpdate.findOne({
    where: { id: updateId, financial_source_id: sourceId }
  });

  if (!update) {
    return next(new AppError('Update not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      update
    }
  });
});

// Create a new update for a financial source
export const createUpdate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to create financial source updates', 401));
  }
  
  const userId = (req.user as User).id;
  const { sourceId } = req.params;
  const { balance, notes, date } = req.body;

  // Check if the financial source exists and belongs to the user
  const financialSource = await FinancialSource.findOne({
    where: { id: sourceId, user_id: userId }
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  // Create the update
  const update = await FinancialSourceUpdate.create({
    financial_source_id: sourceId,
    balance,
    notes: notes || null,
    date: date ? new Date(date) : new Date()
  });
  
  // Calculate and record the new net worth after this update
  try {
    // Calculate the current net worth
    const netWorth = await calculateNetWorth(userId);
    
    // Create a net worth event
    await NetWorthEvent.create({
      user_id: userId,
      net_worth: netWorth,
      event_type: 'BALANCE_UPDATE',
      event_date: new Date()
    });
    
    console.log(`Net worth event created after balance update: ${netWorth}`);
  } catch (error) {
    console.error('Error creating net worth event:', error);
    // Don't fail the request if net worth event creation fails
  }

  res.status(201).json({
    status: 'success',
    data: {
      update
    }
  });
});

// Update a specific update
export const updateUpdate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to update financial source updates', 401));
  }
  
  const userId = (req.user as User).id;
  const { sourceId, updateId } = req.params;
  const { balance, notes, date } = req.body;

  // Check if the financial source exists and belongs to the user
  const financialSource = await FinancialSource.findOne({
    where: { id: sourceId, user_id: userId }
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  // Find the update
  const update = await FinancialSourceUpdate.findOne({
    where: { id: updateId, financial_source_id: sourceId }
  });

  if (!update) {
    return next(new AppError('Update not found', 404));
  }

  // Update the update
  await update.update({
    balance: balance !== undefined ? balance : update.balance,
    notes: notes !== undefined ? notes : update.notes,
    date: date ? new Date(date) : update.date
  });

  res.status(200).json({
    status: 'success',
    data: {
      update
    }
  });
});

// Delete a specific update
export const deleteUpdate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to delete financial source updates', 401));
  }
  
  const userId = (req.user as User).id;
  const { sourceId, updateId } = req.params;

  // Check if the financial source exists and belongs to the user
  const financialSource = await FinancialSource.findOne({
    where: { id: sourceId, user_id: userId }
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  // Find the update
  const update = await FinancialSourceUpdate.findOne({
    where: { id: updateId, financial_source_id: sourceId }
  });

  if (!update) {
    return next(new AppError('Update not found', 404));
  }

  // Delete the update
  await update.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});
