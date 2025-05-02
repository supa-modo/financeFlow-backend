import User from './user.model';
import FinancialSource from './financialSource.model';
import FinancialSourceUpdate from './financialSourceUpdate.model';
import NetWorthEvent from './netWorthEvent.model';

// Set up associations
User.hasMany(FinancialSource, { 
  foreignKey: 'user_id', 
  as: 'financialSources',
  onDelete: 'CASCADE'
});

FinancialSource.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

FinancialSource.hasMany(FinancialSourceUpdate, { 
  foreignKey: 'financial_source_id', 
  as: 'updates',
  onDelete: 'CASCADE'
});

FinancialSourceUpdate.belongsTo(FinancialSource, { 
  foreignKey: 'financial_source_id', 
  as: 'financialSource' 
});

// Set up associations for NetWorthEvent
User.hasMany(NetWorthEvent, {
  foreignKey: 'user_id',
  as: 'netWorthEvents',
  onDelete: 'CASCADE'
});

NetWorthEvent.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

export {
  User,
  FinancialSource,
  FinancialSourceUpdate,
  NetWorthEvent
};
