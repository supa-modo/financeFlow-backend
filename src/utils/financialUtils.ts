import { FinancialSource, FinancialSourceUpdate } from '../models/index';

// Define interface for FinancialSource with updates
interface FinancialSourceWithUpdates extends FinancialSource {
  updates?: FinancialSourceUpdate[];
}

/**
 * Calculate the current net worth for a user
 * @param userId - The user ID
 * @returns The calculated net worth
 */
export const calculateNetWorth = async (userId: string): Promise<number> => {
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
