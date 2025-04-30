import express from 'express';
import { 
  getFinancialSources, 
  getFinancialSource, 
  createFinancialSource, 
  updateFinancialSource, 
  deleteFinancialSource,
  getFinancialSourceTypes,
  getNetWorth,
  getHistoricalNetWorth
} from '../controllers/financialSource.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest, financialSourceSchemas } from '../utils/validators';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get financial source types
router.get('/types', getFinancialSourceTypes);

// Get net worth
router.get('/net-worth', getNetWorth);

// Get historical net worth
router.get('/historical-net-worth', getHistoricalNetWorth);

// Financial source routes
router.route('/')
  .get(getFinancialSources)
  .post(validateRequest(financialSourceSchemas.create), createFinancialSource);

router.route('/:id')
  .get(getFinancialSource)
  .patch(validateRequest(financialSourceSchemas.update), updateFinancialSource)
  .delete(deleteFinancialSource);

export default router;
