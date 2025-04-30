import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let sequelize: Sequelize;

// Check if we're in production and have a DATABASE_URL 
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      // Support for IPv6 connections
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Use individual environment variables for local development
  const dbName = process.env.DB_NAME || 'personal_finance';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: parseInt(dbPort, 10),
    dialect: 'postgres',
    // logging: process.env.NODE_ENV === 'development' ? console.log : false,
    logging:false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Sync all models
// Note: This will be enabled for all environments temporarily
// TODO: Change this to only sync in development environment later
export const syncModels = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize models:', error);
    throw error;
  }
};

export default sequelize;
