'use strict';
const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');

/**
 * Financial data seeder
 * Populates financial sources, updates, and net worth events for a specific user
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // User ID to associate data with
    const userId = 'e2eba6a9-7768-4fef-9ae4-8c57c729273f';
    
    // Define financial sources
    const financialSources = [
      {
        id: uuidv4(),
        user_id: userId,
        name: 'Etica Capital (402)',
        type: 'MONEY_MARKET',
        institution: 'Etica Capital',
        description: 'Cashlet money market account 402',
        color_code: '#4F46E5', // Indigo
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'Etica Capital (618)',
        type: 'MONEY_MARKET',
        institution: 'Etica Capital',
        description: 'Cashlet money market account 618',
        color_code: '#8B5CF6', // Purple
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'CIC INSURANCE MMF',
        type: 'MONEY_MARKET',
        institution: 'CIC INSURANCE',
        description: 'CIC Insurance money market Savings account',
        color_code: '#EC4899', // Pink
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'ZIIDI MMF',
        type: 'MONEY_MARKET',
        institution: 'Safaricom',
        description: 'Ziidi Money Market Fund with Safaricom',
        color_code: '#10B981', // Green
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'KCB BANK',
        type: 'BANK_ACCOUNT',
        institution: 'KCB BANK',
        description: 'KCB Bank account',
        color_code: '#F59E0B', // Amber
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'I&M Bank',
        type: 'BANK_ACCOUNT',
        institution: 'I&M BANK',
        description: 'I&M Bank account',
        color_code: '#3B82F6', // Blue
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'MPESA - 402',
        type: 'MPESA',
        institution: 'Safaricom',
        description: 'M-Pesa mobile money account',
        color_code: '#EF4444', // Red
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'TZS CASH',
        type: 'CASH',
        institution: null,
        description: 'Tanzanian Shillings cash',
        color_code: '#F97316', // Orange
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userId,
        name: 'USD CASH',
        type: 'CASH',
        institution: null,
        description: 'US Dollars cash',
        color_code: '#06B6D4', // Cyan
        is_active: true,
        created_at: new Date('2024-08-28T00:00:00Z'),
        updated_at: new Date('2024-08-28T00:00:00Z')
      }
    ];

    // Insert financial sources
    await queryInterface.bulkInsert('financial_sources', financialSources);

    // Raw financial data from CSV
    const rawData = [
      { date: '09/02/2025 9:39', values: ['KES 39,250.00', 'KES 1,940.88', 'KES 60,084.61', 'KES 2,320.00', 'KES 10.00', 'KES 300.00', 'KES 200.00', 'KES 0.00', 'KES 51,600.00'] },
      { date: '30/01/2025 15:07', values: ['KES 43,108.00', 'KES 1,940.88', 'KES 60,084.61', 'KES 2,300.00', 'KES 10.00', 'KES 51.60', 'KES 1,100.00', 'KES 0.00', 'KES 51,600.00'] },
      { date: '14/11/2024 16:36', values: ['KES 62,678.33', 'KES 1,889.64', 'KES 70,284.44', '', 'KES 50.00', 'KES 1,106.04', 'KES 6,876.37', 'KES 11,000.00', 'KES 51,600.00'] },
      { date: '04/11/2024 9:21', values: ['KES 62,563.50', 'KES 1,882.50', 'KES 70,399.44', '', 'KES 50.00', 'KES 557.71', 'KES 3,100.40', 'KES 7,500.00', 'KES 51,600.00'] },
      { date: '24/10/2024 9:05', values: ['KES 96,683.85', 'KES 1,869.68', 'KES 69,636.44', '', 'KES 50.00', 'KES 1,557.71', 'KES 600.00', 'KES 11,000.00', 'KES 51,600.00'] },
      { date: '21/10/2024 12:08', values: ['KES 96,613.17', 'KES 1,869.68', 'KES 69,636.44', '', 'KES 50.00', 'KES 1,557.71', 'KES 600.00', 'KES 12,000.00', 'KES 51,600.00'] },
      { date: '16/10/2024 14:30', values: ['KES 96,437.00', 'KES 1,869.68', 'KES 69,636.44', '', 'KES 50.00', 'KES 1,557.71', 'KES 600.00', 'KES 12,500.00', 'KES 51,600.00'] },
      { date: '07/10/2024 10:39', values: ['KES 96,118.53', 'KES 1,859.36', 'KES 69,636.44', '', 'KES 50.00', 'KES 1,557.71', 'KES 856.40', 'KES 15,000.00', 'KES 51,600.00'] },
      { date: '01/10/2024 13:35', values: ['KES 95,904.92', 'KES 1,859.36', 'KES 69,636.44', '', 'KES 50.00', 'KES 1,557.71', 'KES 856.40', 'KES 17,500.00', 'KES 51,600.00'] },
      { date: '20/09/2024 13:34', values: ['KES 100,024.67', 'KES 1,850.66', 'KES 69,013.98', '', 'KES 50.00', 'KES 1,557.00', 'KES 1,455.40', 'KES 19,047.62', 'KES 51,600.00'] },
      { date: '19/09/2024 15:32', values: ['KES 97,116.00', 'KES 1,850.66', 'KES 69,013.98', '', 'KES 50.00', 'KES 1,557.00', 'KES 4,485.00', 'KES 19,047.62', 'KES 51,600.00'] },
      { date: '15/09/2024 9:04', values: ['KES 97,827.48', 'KES 1,847.66', 'KES 69,013.98', '', 'KES 50.00', 'KES 107.00', 'KES 100.00', 'KES 17,619.05', 'KES 51,600.00'] },
      { date: '12/09/2024 9:25', values: ['KES 97,654.92', 'KES 1,843.52', 'KES 69,013.98', '', 'KES 50.00', 'KES 107.00', 'KES 110.00', 'KES 17,619.05', 'KES 51,600.00'] },
      { date: '11/09/2024 21:28', values: ['KES 97,614.63', 'KES 1,843.52', 'KES 69,013.98', '', 'KES 50.00', 'KES 107.00', 'KES 10,100.00', 'KES 17,619.05', 'KES 51,600.00'] },
      { date: '10/09/2024 11:29', values: ['KES 107,639.63', 'KES 1,843.52', 'KES 69,013.98', '', 'KES 50.00', 'KES 107.00', 'KES 100.00', 'KES 17,619.05', 'KES 51,600.00'] },
      { date: '09/09/2024 22:17', values: ['KES 107,558.99', 'KES 1,843.52', 'KES 69,013.98', '', 'KES 50.00', 'KES 107.00', 'KES 110.00', 'KES 17,619.05', 'KES 51,600.00'] },
      { date: '08/09/2024 14:34', values: ['KES 107,518.38', 'KES 1,843.52', 'KES 69,013.98', '', 'KES 50.00', 'KES 406.71', 'KES 110.00', 'KES 19,047.62', 'KES 51,600.00'] },
      { date: '07/09/2024 16:51', values: ['KES 107,477.72', 'KES 1,843.12', 'KES 69,013.98', '', 'KES 50.00', 'KES 406.71', 'KES 110.00', 'KES 19,047.62', 'KES 51,600.00'] },
      { date: '06/09/2024 20:20', values: ['KES 107,436.99', 'KES 1,842.12', 'KES 69,013.98', '', 'KES 50.00', 'KES 406.71', 'KES 110.00', 'KES 19,047.62', 'KES 51,600.00'] },
      { date: '05/09/2024 12:20', values: ['KES 107,396.61', 'KES 1,840.73', 'KES 69,013.98', '', 'KES 50.00', 'KES 406.71', 'KES 110.00', 'KES 19,523.81', 'KES 51,600.00'] },
      { date: '04/09/2024 13:25', values: ['KES 106,656.21', 'KES 1,840.73', 'KES 69,013.98', '', 'KES 52.00', 'KES 406.71', 'KES 830.00', 'KES 19,523.81', 'KES 51,600.00'] },
      { date: '03/09/2024 13:19', values: ['KES 106,615.76', 'KES 1,839.33', 'KES 69,013.98', '', 'KES 52.00', 'KES 406.71', 'KES 830.00', 'KES 19,523.81', 'KES 51,600.00'] },
      { date: '02/09/2024 21:40', values: ['KES 106,575.25', 'KES 1,839.33', 'KES 69,013.98', '', 'KES 52.00', 'KES 406.71', 'KES 830.00', 'KES 19,523.81', 'KES 51,600.00'] },
      { date: '01/09/2024 12:47', values: ['KES 106,534.56', 'KES 1,838.63', 'KES 69,128.45', '', 'KES 52.00', 'KES 406.71', 'KES 830.00', 'KES 20,238.10', 'KES 51,600.00'] },
      { date: '31/08/2024 15:24', values: ['KES 106,494.44', 'KES 1,837.94', 'KES 68,365.35', '', 'KES 52.00', 'KES 306.71', 'KES 450.00', 'KES 21,500.00', 'KES 52,000.00'] },
      { date: '28/08/2024 15:24', values: ['KES 106,214.44', 'KES 1,837.94', 'KES 68,365.35', '', 'KES 52.00', 'KES 306.71', 'KES 450.00', 'KES 21,500.00', 'KES 52,000.00'] }
    ];

    // Helper function to parse KES values
    const parseKESValue = (kesValue) => {
      if (!kesValue || kesValue.trim() === '') return 0;
      return parseFloat(kesValue.replace('KES', '').replace(/,/g, '').trim());
    };

    // Helper function to parse date strings
    const parseDate = (dateStr) => {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      
      // Parse time components
      const [hours, minutes] = timePart.split(':');
      
      // Use direct Date constructor (months are 0-based in JS Date)
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10),
        0
      );
    };

    // Prepare financial source updates and net worth events
    const financialSourceUpdates = [];
    const netWorthEvents = [];

    // Process each data entry (date)
    rawData.forEach(entry => {
      const eventDate = parseDate(entry.date);
      let totalNetWorth = 0;
      
      // Process updates for each financial source
      financialSources.forEach((source, index) => {
        const rawValue = entry.values[index];
        const balance = parseKESValue(rawValue);
        totalNetWorth += balance;
        
        // Only create updates for sources with values
        if (rawValue && rawValue.trim() !== '') {
          financialSourceUpdates.push({
            id: uuidv4(),
            financial_source_id: source.id,
            balance: balance,
            notes: `Balance update on ${eventDate.toISOString().split('T')[0]}`,
            date: eventDate,
            created_at: eventDate,
            updated_at: eventDate
          });
        }
      });
      
      // Create net worth event for this date
      netWorthEvents.push({
        id: uuidv4(),
        user_id: userId,
        net_worth: totalNetWorth,
        event_type: 'BALANCE_UPDATE',
        event_date: eventDate,
        created_at: eventDate,
        updated_at: eventDate
      });
    });

    // Insert financial source updates
    await queryInterface.bulkInsert('financial_source_updates', financialSourceUpdates);
    
    // Insert net worth events
    await queryInterface.bulkInsert('net_worth_events', netWorthEvents);
  },

  async down(queryInterface, Sequelize) {
    // User ID to clean up data for
    const userId = 'e2eba6a9-7768-4fef-9ae4-8c57c729273f';
    
    // Delete net worth events for this user
    await queryInterface.bulkDelete('net_worth_events', { user_id: userId });
    
    // Get financial source IDs for this user
    const financialSources = await queryInterface.sequelize.query(
      `SELECT id FROM financial_sources WHERE user_id = '${userId}'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const sourceIds = financialSources.map(source => source.id);
    
    // Delete financial source updates for these sources
    if (sourceIds.length > 0) {
      await queryInterface.bulkDelete('financial_source_updates', {
        financial_source_id: { [Sequelize.Op.in]: sourceIds }
      });
    }
    
    // Delete financial sources for this user
    await queryInterface.bulkDelete('financial_sources', { user_id: userId });
  }
};
