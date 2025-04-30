import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN || '7';

// Interface for our JWT payload
export interface JwtUserPayload {
  id: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token
 * @param id - User ID to include in the token
 * @returns JWT token string
 */
export const generateToken = (id: string): string => {
  // @ts-ignore - Ignoring type checking for jwt.sign due to complex type definitions
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): JwtUserPayload => {
  // @ts-ignore - Ignoring type checking for jwt.verify due to complex type definitions
  return jwt.verify(token, JWT_SECRET);
};

export default {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_COOKIE_EXPIRES_IN,
  generateToken,
  verifyToken
};
