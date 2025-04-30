# Personal Finance Management System - Backend Guide

This guide provides a comprehensive overview of the backend architecture for the Personal Finance Management System. It explains the structure, components, and functionality of the backend system to help new developers understand and work with the codebase.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Models](#models)
3. [Controllers](#controllers)
4. [Routes](#routes)
5. [Services](#services)
6. [Middlewares](#middlewares)
7. [Utilities](#utilities)
8. [Configuration](#configuration)
9. [Authentication Flow](#authentication-flow)
10. [API Endpoints](#api-endpoints)
11. [Error Handling](#error-handling)
12. [Database Schema](#database-schema)

## Project Structure

The backend follows a modular architecture based on the MVC (Model-View-Controller) pattern with additional service and utility layers. Here's the directory structure:

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── .env                  # Environment variables
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Models

Models represent the database tables and define the structure of the data. They are implemented using Sequelize ORM.

### User Model (`src/models/user.model.ts`)

Represents a user in the system.

**Fields:**
- `id` (UUID): Primary key
- `name` (String): User's full name
- `email` (String): User's email address (unique)
- `password` (String): Hashed password
- `notification_settings` (JSON): User's notification preferences
- `created_at` (Date): Record creation timestamp
- `updated_at` (Date): Record update timestamp

**Methods:**
- `correctPassword(candidatePassword)`: Checks if a provided password matches the stored hash
- `changePassword(newPassword)`: Updates the user's password

### Financial Source Model (to be implemented)

Will represent different financial accounts or sources of funds.

**Fields:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to User
- `name` (String): Name of the financial source
- `type` (Enum): Type of financial source (e.g., bank, investment, cash)
- `description` (String): Optional description
- `color_code` (String): Color for UI representation
- `is_active` (Boolean): Whether the source is active
- `created_at` (Date): Record creation timestamp
- `updated_at` (Date): Record update timestamp

### Financial Source Update Model (to be implemented)

Will represent balance updates for financial sources.

**Fields:**
- `id` (UUID): Primary key
- `financial_source_id` (UUID): Foreign key to Financial Source
- `amount` (Decimal): Balance amount
- `date` (Date): Date of the balance
- `notes` (String): Optional notes
- `created_at` (Date): Record creation timestamp
- `updated_at` (Date): Record update timestamp

## Controllers

Controllers handle the HTTP requests and responses. They use services to perform business logic and return appropriate responses.

### Auth Controller (`src/controllers/auth.controller.ts`)

Handles user authentication and account management.

**Functions:**
- `register`: Creates a new user account
- `login`: Authenticates a user and issues a JWT token
- `logout`: Logs out a user by clearing the JWT cookie
- `getCurrentUser`: Returns the current authenticated user's information
- `updatePassword`: Updates a user's password

### Financial Source Controller (to be implemented)

Will handle CRUD operations for financial sources.

**Functions:**
- `createFinancialSource`: Creates a new financial source
- `getFinancialSources`: Retrieves all financial sources for a user
- `getFinancialSource`: Retrieves a specific financial source
- `updateFinancialSource`: Updates a financial source
- `deleteFinancialSource`: Deletes a financial source

### Financial Source Update Controller (to be implemented)

Will handle balance updates for financial sources.

**Functions:**
- `createUpdate`: Adds a new balance update
- `getUpdates`: Retrieves all updates for a financial source
- `getUpdate`: Retrieves a specific update
- `updateUpdate`: Modifies an existing update
- `deleteUpdate`: Removes an update

## Routes

Routes define the API endpoints and connect them to the appropriate controllers.

### Auth Routes (`src/routes/auth.routes.ts`)

**Endpoints:**
- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login a user
- `GET /api/v1/auth/logout`: Logout a user
- `GET /api/v1/auth/me`: Get current user profile
- `PATCH /api/v1/auth/update-password`: Update user password

### Financial Source Routes (to be implemented)

**Endpoints:**
- `GET /api/v1/financial-sources`: Get all financial sources
- `POST /api/v1/financial-sources`: Create a new financial source
- `GET /api/v1/financial-sources/:id`: Get a specific financial source
- `PATCH /api/v1/financial-sources/:id`: Update a financial source
- `DELETE /api/v1/financial-sources/:id`: Delete a financial source

### Financial Source Update Routes (to be implemented)

**Endpoints:**
- `GET /api/v1/financial-sources/:id/updates`: Get all updates for a financial source
- `POST /api/v1/financial-sources/:id/updates`: Add a new update
- `GET /api/v1/financial-sources/:id/updates/:updateId`: Get a specific update
- `PATCH /api/v1/financial-sources/:id/updates/:updateId`: Update a specific update
- `DELETE /api/v1/financial-sources/:id/updates/:updateId`: Delete a specific update

## Services

Services contain the business logic of the application. They are used by controllers to perform operations.

### Auth Service (to be implemented)

Will handle user authentication and account management logic.

**Functions:**
- `createUser`: Creates a new user in the database
- `findUserByEmail`: Finds a user by email
- `validatePassword`: Validates a user's password
- `generateAuthToken`: Generates a JWT token for a user

### Financial Service (to be implemented)

Will handle financial source and update operations.

**Functions:**
- `createFinancialSource`: Creates a new financial source
- `updateFinancialSource`: Updates a financial source
- `deleteFinancialSource`: Deletes a financial source
- `addBalanceUpdate`: Adds a new balance update
- `calculateNetWorth`: Calculates a user's net worth
- `getFinancialHistory`: Retrieves historical financial data

## Middlewares

Middlewares are functions that have access to the request and response objects and can perform operations before the request is processed by the controller.

### Auth Middleware (`src/middlewares/auth.middleware.ts`)

Handles authentication and authorization.

**Functions:**
- `protect`: Ensures a route is only accessible to authenticated users
- `isLoggedIn`: Checks if a user is logged in (for optional authentication)

### Error Middleware (`src/middlewares/error.middleware.ts`)

Handles error processing and formatting.

**Functions:**
- `errorHandler`: Global error handling middleware that formats errors for the client

## Utilities

Utilities are helper functions used throughout the application.

### AppError (`src/utils/appError.ts`)

Custom error class for application errors.

**Properties:**
- `statusCode`: HTTP status code
- `status`: Error status ('fail' or 'error')
- `isOperational`: Whether the error is operational or programming

### CatchAsync (`src/utils/catchAsync.ts`)

Utility to handle async errors in Express routes.

**Function:**
- `catchAsync`: Wraps an async function and catches any errors

### Validators (`src/utils/validators.ts`)

Validation utilities for request data.

**Schemas:**
- `authSchemas.register`: Validates registration data
- `authSchemas.login`: Validates login data
- `authSchemas.updatePassword`: Validates password update data

**Functions:**
- `validateRequest`: Middleware to validate request data against a schema

### Logger (`src/utils/logger.ts`)

Logging utility for the application.

**Functions:**
- `info`: Logs informational messages
- `error`: Logs error messages
- `warn`: Logs warning messages
- `debug`: Logs debug messages

## Configuration

Configuration files set up various aspects of the application.

### Database Configuration (`src/config/database.ts`)

Sets up the database connection using Sequelize.

**Functions:**
- `testConnection`: Tests the database connection

### JWT Configuration (`src/config/jwt.ts`)

Configures JWT token generation and verification.

**Functions:**
- `generateToken`: Generates a JWT token for a user
- `verifyToken`: Verifies a JWT token

## Authentication Flow

1. **Registration:**
   - User submits registration data
   - Server validates the data
   - Password is hashed using bcrypt
   - User is created in the database
   - JWT token is generated and sent to the client
   - Token is stored as an HTTP-only cookie

2. **Login:**
   - User submits email and password
   - Server validates the credentials
   - JWT token is generated and sent to the client
   - Token is stored as an HTTP-only cookie

3. **Authentication:**
   - Client includes the JWT cookie in requests
   - `protect` middleware verifies the token
   - If valid, the request proceeds to the controller
   - If invalid, an error is returned

4. **Logout:**
   - JWT cookie is cleared

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
  - Body: `{ name, email, password, passwordConfirm }`
  - Response: `{ status, token, data: { user } }`

- `POST /api/v1/auth/login` - Login a user
  - Body: `{ email, password }`
  - Response: `{ status, token, data: { user } }`

- `GET /api/v1/auth/logout` - Logout a user
  - Response: `{ status }`

- `GET /api/v1/auth/me` - Get current user profile
  - Response: `{ status, data: { user } }`

- `PATCH /api/v1/auth/update-password` - Update user password
  - Body: `{ currentPassword, newPassword, newPasswordConfirm }`
  - Response: `{ status, token, data: { user } }`

### Financial Sources (to be implemented)

- `GET /api/v1/financial-sources` - Get all financial sources
- `POST /api/v1/financial-sources` - Create a new financial source
- `GET /api/v1/financial-sources/:id` - Get a specific financial source
- `PATCH /api/v1/financial-sources/:id` - Update a financial source
- `DELETE /api/v1/financial-sources/:id` - Delete a financial source

### Financial Source Updates (to be implemented)

- `GET /api/v1/financial-sources/:id/updates` - Get all updates for a financial source
- `POST /api/v1/financial-sources/:id/updates` - Add a new update
- `GET /api/v1/financial-sources/:id/updates/:updateId` - Get a specific update
- `PATCH /api/v1/financial-sources/:id/updates/:updateId` - Update a specific update
- `DELETE /api/v1/financial-sources/:id/updates/:updateId` - Delete a specific update

## Error Handling

The application uses a centralized error handling approach:

1. Operational errors (e.g., validation errors, authentication errors) are created using the `AppError` class
2. Async functions are wrapped with the `catchAsync` utility to catch errors
3. The global error handler middleware formats errors based on the environment:
   - Development: Detailed error information
   - Production: Limited error information for security

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  notification_settings JSONB NOT NULL DEFAULT '{"email_notifications": true, "reminder_frequency": "weekly"}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Financial Sources Table (to be implemented)

```sql
CREATE TABLE financial_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  color_code VARCHAR(7),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Financial Source Updates Table (to be implemented)

```sql
CREATE TABLE financial_source_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financial_source_id UUID NOT NULL REFERENCES financial_sources(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Getting Started

To run the backend server:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` and update the values

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```
