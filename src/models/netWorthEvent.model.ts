import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Net worth event attributes interface
interface NetWorthEventAttributes {
  id: string;
  user_id: string;
  net_worth: number;
  event_type: 'BALANCE_UPDATE' | 'FINANCIAL_SOURCE_ADDED' | 'FINANCIAL_SOURCE_DELETED' | 'MANUAL';
  event_date: Date;
  created_at: Date;
  updated_at: Date;
}

// Net worth event creation attributes interface (optional fields for creation)
interface NetWorthEventCreationAttributes extends Optional<NetWorthEventAttributes, 'id' | 'created_at' | 'updated_at'> {}

// Net worth event model class
class NetWorthEvent extends Model<NetWorthEventAttributes, NetWorthEventCreationAttributes> implements NetWorthEventAttributes {
  public id!: string;
  public user_id!: string;
  public net_worth!: number;
  public event_type!: 'BALANCE_UPDATE' | 'FINANCIAL_SOURCE_ADDED' | 'FINANCIAL_SOURCE_DELETED' | 'MANUAL';
  public event_date!: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

// Initialize Net Worth Event model
NetWorthEvent.init(
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
    net_worth: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    event_type: {
      type: DataTypes.ENUM('BALANCE_UPDATE', 'FINANCIAL_SOURCE_ADDED', 'FINANCIAL_SOURCE_DELETED', 'MANUAL'),
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    modelName: 'net_worth_event',
    tableName: 'net_worth_events',
    timestamps: true,
    underscored: true,
  }
);

export default NetWorthEvent;
