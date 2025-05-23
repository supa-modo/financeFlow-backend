import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/appError';
import './config/passport'; // Import passport configuration

// Import routes
import authRoutes from './routes/auth.routes';
import financialSourceRoutes from './routes/financialSource.routes';
import financialSourceUpdateRoutes from './routes/financialSourceUpdate.routes';
import netWorthEventRoutes from './routes/netWorthEvent.routes';

dotenv.config();

// Create Express app
const app = express();

// Set security HTTP headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Request logging with Morgan
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));


app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://personal-finance-tracker-eight-green.vercel.app',
      'https://financeflow.com',
      'https://financeflow-app.netlify.app'
    ];
    
    // Add CLIENT_URL from env if it exists and is not already in the list
    if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }
    
    // In development, be more permissive with CORS
    if (process.env.NODE_ENV === 'development') {
      // Allow any localhost origin in development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin']
}));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Initialize passport
app.use(passport.initialize());

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/financial-sources', financialSourceRoutes);
app.use('/api/v1/financial-sources/:sourceId/updates', financialSourceUpdateRoutes);
app.use('/api/v1/net-worth-events', netWorthEventRoutes);

// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
