import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import FinancialSource from './financialSource.model';

// Financial source update attributes interface
interface FinancialSourceUpdateAttributes {
  id: string;
  financial_source_id: string;
  balance: number;
  notes: string | null;
  date: Date;
  created_at: Date;
  updated_at: Date;
}

// Financial source update creation attributes interface (optional fields for creation)
interface FinancialSourceUpdateCreationAttributes extends Optional<FinancialSourceUpdateAttributes, 'id' | 'notes' | 'date' | 'created_at' | 'updated_at'> {}

// Financial source update model class
class FinancialSourceUpdate extends Model<FinancialSourceUpdateAttributes, FinancialSourceUpdateCreationAttributes> implements FinancialSourceUpdateAttributes {
  public id!: string;
  public financial_source_id!: string;
  public balance!: number;
  public notes!: string | null;
  public date!: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate() {
    FinancialSourceUpdate.belongsTo(FinancialSource, { foreignKey: 'financial_source_id', as: 'financialSource' });
  }
}

// Initialize Financial Source Update model
FinancialSourceUpdate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    financial_source_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'financial_sources',
        key: 'id',
      },
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    modelName: 'FinancialSourceUpdate',
    tableName: 'financial_source_updates',
    timestamps: true,
    underscored: true,
  }
);

export default FinancialSourceUpdate;
