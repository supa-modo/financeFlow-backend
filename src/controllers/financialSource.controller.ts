import { Request, Response, NextFunction } from 'express';
import { FinancialSource, FinancialSourceUpdate } from '../models/index';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { FinancialSourceType } from '../models/financialSource.model';
import { Op } from 'sequelize';

// Get all financial sources for the current user
export const getFinancialSources = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;

  const financialSources = await FinancialSource.findAll({
    where: { user_id: userId },
    include: [
      {
        model: FinancialSourceUpdate,
        as: 'updates',
        attributes: ['id', 'balance', 'notes', 'date', 'created_at'],
        order: [['date', 'DESC'], ['created_at', 'DESC']]
      }
    ],
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    results: financialSources.length,
    data: {
      financialSources
    }
  });
});

// Get a specific financial source by ID
export const getFinancialSource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { id } = req.params;

  const financialSource = await FinancialSource.findOne({
    where: { id, user_id: userId },
    include: [
      {
        model: FinancialSourceUpdate,
        as: 'updates',
        attributes: ['id', 'balance', 'notes', 'date', 'created_at'],
        order: [['date', 'DESC'], ['created_at', 'DESC']]
      }
    ]
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      financialSource
    }
  });
});

// Create a new financial source
export const createFinancialSource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { name, type, description, colorCode, initialBalance, notes } = req.body;

  // Create the financial source
  const financialSource = await FinancialSource.create({
    user_id: userId,
    name,
    type,
    description: description || null,
    color_code: colorCode || null,
    is_active: true
  });

  // Create initial balance update if provided
  if (initialBalance !== undefined) {
    await FinancialSourceUpdate.create({
      financial_source_id: financialSource.id,
      balance: initialBalance,
      notes: notes || 'Initial balance',
      date: new Date()
    });
  }

  // Fetch the created financial source with its updates
  const createdSource = await FinancialSource.findByPk(financialSource.id, {
    include: [
      {
        model: FinancialSourceUpdate,
        as: 'updates',
        attributes: ['id', 'balance', 'notes', 'date', 'created_at'],
        order: [['date', 'DESC'], ['created_at', 'DESC']]
      }
    ]
  });

  res.status(201).json({
    status: 'success',
    data: {
      financialSource: createdSource
    }
  });
});

// Update a financial source
export const updateFinancialSource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, type, description, colorCode, isActive } = req.body;

  // Find the financial source
  const financialSource = await FinancialSource.findOne({
    where: { id, user_id: userId }
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  // Update the financial source
  await financialSource.update({
    name: name !== undefined ? name : financialSource.name,
    type: type !== undefined ? type : financialSource.type,
    description: description !== undefined ? description : financialSource.description,
    color_code: colorCode !== undefined ? colorCode : financialSource.color_code,
    is_active: isActive !== undefined ? isActive : financialSource.is_active
  });

  // Fetch the updated financial source with its updates
  const updatedSource = await FinancialSource.findByPk(financialSource.id, {
    include: [
      {
        model: FinancialSourceUpdate,
        as: 'updates',
        attributes: ['id', 'balance', 'notes', 'date', 'created_at'],
        order: [['date', 'DESC'], ['created_at', 'DESC']]
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      financialSource: updatedSource
    }
  });
});

// Delete a financial source
export const deleteFinancialSource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Find the financial source
  const financialSource = await FinancialSource.findOne({
    where: { id, user_id: userId }
  });

  if (!financialSource) {
    return next(new AppError('Financial source not found', 404));
  }

  // Delete the financial source (cascade will delete updates)
  await financialSource.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get financial source types
export const getFinancialSourceTypes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const types = Object.values(FinancialSourceType);

  res.status(200).json({
    status: 'success',
    data: {
      types
    }
  });
});

// Get current net worth
export const getNetWorth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;

  // Get all active financial sources with their latest updates
  const financialSources = await FinancialSource.findAll({
    where: { 
      user_id: userId,
      is_active: true 
    },
    include: [{
      model: FinancialSourceUpdate,
      as: 'updates',
      attributes: ['id', 'balance', 'date', 'created_at'],
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      limit: 1
    }]
  });

  // Calculate net worth by summing the latest balance of each source
  const netWorth = financialSources.reduce((total, source: any) => {
    const latestUpdate = source.updates && source.updates.length > 0 ? source.updates[0] : null;
    return total + (latestUpdate ? parseFloat(latestUpdate.balance.toString()) : 0);
  }, 0);

  res.status(200).json({
    status: 'success',
    data: {
      netWorth
    }
  });
});

// Get historical net worth data
export const getHistoricalNetWorth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const { period = 'month' } = req.query;

  // Determine the start date based on the period
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }

  // Get all active financial sources
  const financialSources = await FinancialSource.findAll({
    where: { 
      user_id: userId,
      is_active: true 
    },
    attributes: ['id', 'name', 'type', 'color_code']
  });

  // Get all updates for these sources within the period
  const updates = await FinancialSourceUpdate.findAll({
    where: {
      financial_source_id: financialSources.map(source => source.id),
      date: { [Op.gte]: startDate }
    },
    order: [['date', 'ASC'], ['created_at', 'ASC']]
  });

  // Group updates by date
  const dateMap = new Map();
  
  updates.forEach(update => {
    // Ensure date is a valid Date object
    let dateObj;
    try {
      // Handle if date is a string or already a Date object
      dateObj = update.date instanceof Date ? update.date : new Date(update.date);
      const dateStr = dateObj.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          netWorth: 0,
          sources: {}
        });
      }
    } catch (error) {
      console.error(`Invalid date format for update ID ${update.id}:`, update.date);
      // Skip this update if date is invalid
    }
  });

  // Sort dates chronologically
  const sortedDates = Array.from(dateMap.keys()).sort();
  
  // Create a running record of the latest balance for each source
  const latestBalances: Record<string, any> = {};
  
  // For each date, calculate the net worth based on the latest known balance of each source
  sortedDates.forEach(date => {
    const dateData = dateMap.get(date);
    
    // Get updates for this date
    const dateUpdates = updates.filter(update => {
      try {
        // Handle if date is a string or already a Date object
        const dateObj = update.date instanceof Date ? update.date : new Date(update.date);
        return dateObj.toISOString().split('T')[0] === date;
      } catch (error) {
        return false;
      }
    });
    
    // Update the latest balance for each source that has an update on this date
    dateUpdates.forEach(update => {
      const source = financialSources.find(s => s.id === update.financial_source_id);
      if (source) {
        latestBalances[source.id] = {
          id: source.id,
          name: source.name,
          type: source.type,
          color_code: source.color_code,
          balance: parseFloat(update.balance.toString())
        };
      }
    });
    
    // Set the sources for this date to be all sources with their latest known balance
    dateData.sources = { ...latestBalances };
    
    // Calculate net worth for this date
    dateData.netWorth = Object.values(latestBalances).reduce(
      (total: number, source: any) => total + source.balance,
      0
    );
  });
  
  // Convert the map to an array
  const historicalData = sortedDates.map(date => dateMap.get(date));
  
  res.status(200).json({
    status: 'success',
    data: {
      historicalData
    }
  });
});
