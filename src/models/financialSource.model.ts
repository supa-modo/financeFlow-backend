import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

// Financial source types enum
export enum FinancialSourceType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  MONEY_MARKET = 'MONEY_MARKET',
  STOCKS = 'STOCKS',
  MPESA = 'MPESA',
  SACCO = 'SACCO',
  CASH = 'CASH',
  OTHER = 'OTHER'
}

// Financial source attributes interface
interface FinancialSourceAttributes {
  id: string;
  user_id: string;
  name: string;
  type: FinancialSourceType;
  institution: string | null;
  description: string | null;
  color_code: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Financial source creation attributes interface (optional fields for creation)
interface FinancialSourceCreationAttributes extends Optional<FinancialSourceAttributes, 'id' | 'institution' | 'description' | 'color_code' | 'is_active' | 'created_at' | 'updated_at'> {}

// Financial source model class
class FinancialSource extends Model<FinancialSourceAttributes, FinancialSourceCreationAttributes> implements FinancialSourceAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public type!: FinancialSourceType;
  public institution!: string | null;
  public description!: string | null;
  public color_code!: string | null;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate() {
    FinancialSource.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  }
}

// Initialize Financial Source model
FinancialSource.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(FinancialSourceType)),
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i, // Validate hex color code
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'FinancialSource',
    tableName: 'financial_sources',
    timestamps: true,
    underscored: true,
  }
);

export default FinancialSource;
