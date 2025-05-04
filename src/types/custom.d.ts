// Define a custom User interface for the request object
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  notification_settings: object;
  password_reset_token?: string;
  password_reset_expires?: Date;
  provider?: string;
  provider_id?: string;
  created_at: Date;
  updated_at: Date;
  [key: string]: any; // Allow for any additional properties
}

// Use the User interface for the request object
type RequestUser = User;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

