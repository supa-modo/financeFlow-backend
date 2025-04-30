import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';

// User attributes interface
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  notification_settings: object;
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
  public created_at!: Date;
  public updated_at!: Date;

  // Method to check if password is correct
  public async correctPassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Method to change password
  public async changePassword(newPassword: string): Promise<void> {
    this.password = await bcrypt.hash(newPassword, 12);
    await this.save();
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
