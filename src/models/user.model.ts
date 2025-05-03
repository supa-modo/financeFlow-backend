import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sequelize from '../config/database';

// User attributes interface
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  notification_settings: object;
  password_reset_token?: string;
  password_reset_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

// User creation attributes interface (optional fields for creation)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'notification_settings' | 'created_at' | 'updated_at'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public notification_settings!: object;
  public password_reset_token?: string;
  public password_reset_expires?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // Method to check if password is correct
  public async correctPassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Method to change password
  public async changePassword(newPassword: string): Promise<void> {
    // We don't need to hash the password here as it will be hashed by the beforeSave hook
    this.password = newPassword;
    await this.save();
  }

  // Method to create password reset token
  public createPasswordResetToken(): string {
    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and store it in the database
    this.password_reset_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration (10 minutes from now)
    this.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000);

    // We don't save here - the controller will handle saving
    // This prevents issues where the save might fail silently
    
    // Return the unhashed token (to be sent via email)
    return resetToken;
  }

  // Method to clear password reset token
  public clearPasswordResetToken(): void {
    this.password_reset_token = undefined;
    this.password_reset_expires = undefined;
  }
}

// Initialize User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notification_settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        email_notifications: true,
        reminder_frequency: 'weekly',
      },
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hash password before saving
      beforeSave: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

export default User;
