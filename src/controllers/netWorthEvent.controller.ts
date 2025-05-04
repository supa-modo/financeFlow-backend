import { Request, Response, NextFunction } from 'express';
import { NetWorthEvent, FinancialSource, FinancialSourceUpdate } from '../models/index';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { Op } from 'sequelize';
import { User } from '../types/custom';

// Define interface for FinancialSource with updates
interface FinancialSourceWithUpdates extends FinancialSource {
  updates?: FinancialSourceUpdate[];
}

// Calculate current net worth for a user
const calculateNetWorth = async (userId: string): Promise<number> => {
  // Get all active financial sources for the user
  const sources = await FinancialSource.findAll<FinancialSourceWithUpdates>({
    where: { 
      user_id: userId,
      is_active: true
    },
    include: [
      {
        model: FinancialSourceUpdate,
        as: 'updates',
        attributes: ['id', 'balance', 'date', 'created_at'],
        order: [['date', 'DESC'], ['created_at', 'DESC']]
      }
    ]
  });

  // Calculate total net worth by summing the latest balance of each source
  let netWorth = 0;
  
  for (const source of sources) {
    if (source.updates && source.updates.length > 0) {
      // Sort updates by date and created_at (newest first)
      const sortedUpdates = [...source.updates].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Add the latest balance to net worth
      netWorth += parseFloat(sortedUpdates[0].balance.toString());
    }
  }
  
  return netWorth;
};

// Create a net worth event
export const createNetWorthEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to create net worth events', 401));
  }
  
  const userId = (req.user as User).id;
  const { eventType, eventDate } = req.body;
  
  // Calculate current net worth
  const netWorth = await calculateNetWorth(userId);
  
  // Create the net worth event
  const netWorthEvent = await NetWorthEvent.create({
    user_id: userId,
    net_worth: netWorth,
    event_type: eventType || 'MANUAL',
    event_date: eventDate || new Date()
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      netWorthEvent
    }
  });
});

// Get all net worth events for the current user
export const getNetWorthEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to access net worth events', 401));
  }
  
  const userId = (req.user as User).id;
  const { period = 'all', limit = 100 } = req.query;
  
  // Determine the start date based on the period
  let startDate: Date | null = null;
  const now = new Date();
  
  if (period === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  } else if (period === 'quarter') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 3);
  } else if (period === 'year') {
    startDate = new Date(now);
    startDate.setFullYear(now.getFullYear() - 1);
  }
  
  // Build the query
  const whereClause: any = { user_id: userId };
  if (startDate) {
    whereClause.event_date = {
      [Op.gte]: startDate
    };
  }
  
  // Get net worth events
  const netWorthEvents = await NetWorthEvent.findAll({
    where: whereClause,
    order: [['event_date', 'ASC']],
    limit: parseInt(limit as string, 10)
  });
  
  res.status(200).json({
    status: 'success',
    results: netWorthEvents.length,
    data: {
      netWorthEvents
    }
  });
});

// Get a specific net worth event by ID
export const getNetWorthEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to access net worth events', 401));
  }
  
  const userId = (req.user as User).id;
  const { id } = req.params;
  
  const netWorthEvent = await NetWorthEvent.findOne({
    where: { id, user_id: userId }
  });
  
  if (!netWorthEvent) {
    return next(new AppError('Net worth event not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      netWorthEvent
    }
  });
});

// Delete a net worth event
export const deleteNetWorthEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to delete net worth events', 401));
  }
  
  const userId = (req.user as User).id;
  const { id } = req.params;
  
  const netWorthEvent = await NetWorthEvent.findOne({
    where: { id, user_id: userId }
  });
  
  if (!netWorthEvent) {
    return next(new AppError('Net worth event not found', 404));
  }
  
  await netWorthEvent.destroy();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get the latest net worth
export const getLatestNetWorth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request
  if (!req.user) {
    return next(new AppError('You must be logged in to access net worth data', 401));
  }
  
  const userId = (req.user as User).id;
  
  // Get the latest net worth event
  const latestEvent = await NetWorthEvent.findOne({
    where: { user_id: userId },
    order: [['event_date', 'DESC']]
  });
  
  let netWorth = 0;
  
  if (latestEvent) {
    netWorth = parseFloat(latestEvent.net_worth.toString());
  } else {
    // If no events exist, calculate current net worth
    netWorth = await calculateNetWorth(userId);
    
    // Create an initial net worth event
    await NetWorthEvent.create({
      user_id: userId,
      net_worth: netWorth,
      event_type: 'MANUAL',
      event_date: new Date()
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      netWorth
    }
  });
});
