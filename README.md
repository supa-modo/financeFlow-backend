# Personal Finance Management System - Backend

This is the backend API for the Personal Finance Management System. It provides authentication, financial source management, and balance tracking functionality.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- Sequelize ORM
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` and update the values

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login a user
- `GET /api/v1/auth/logout` - Logout a user
- `GET /api/v1/auth/me` - Get current user profile
- `PATCH /api/v1/auth/update-password` - Update user password

### Financial Sources (to be implemented)

- `GET /api/v1/financial-sources` - Get all financial sources
- `POST /api/v1/financial-sources` - Create a new financial source
- `GET /api/v1/financial-sources/:id` - Get a specific financial source
- `PATCH /api/v1/financial-sources/:id` - Update a financial source
- `DELETE /api/v1/financial-sources/:id` - Delete a financial source

### Financial Source Updates (to be implemented)

- `GET /api/v1/financial-sources/:id/updates` - Get all updates for a financial source
- `POST /api/v1/financial-sources/:id/updates` - Add a new update for a financial source
- `GET /api/v1/financial-sources/:id/updates/:updateId` - Get a specific update
- `PATCH /api/v1/financial-sources/:id/updates/:updateId` - Update a specific update
- `DELETE /api/v1/financial-sources/:id/updates/:updateId` - Delete a specific update

## Authentication Flow

The authentication system uses JWT tokens with HttpOnly cookies for secure authentication:

1. User registers or logs in
2. Server validates credentials and generates a JWT token
3. Token is sent to the client as an HttpOnly cookie
4. Client includes the cookie in subsequent requests
5. Protected routes check for valid token before processing requests

## Database Models

### User Model

- id (UUID, primary key)
- name (string)
- email (string, unique)
- password (string, hashed)
- notification_settings (JSON)
- created_at (timestamp)
- updated_at (timestamp)

### Financial Source Model (to be implemented)

- id (UUID, primary key)
- user_id (UUID, foreign key)
- name (string)
- type (enum)
- description (string)
- color_code (string)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

### Financial Source Update Model (to be implemented)

- id (UUID, primary key)
- financial_source_id (UUID, foreign key)
- amount (decimal)
- date (date)
- notes (string)
- created_at (timestamp)
- updated_at (timestamp)
