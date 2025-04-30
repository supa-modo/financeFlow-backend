import express from 'express';
import { 
  getUpdates, 
  getUpdate, 
  createUpdate, 
  updateUpdate, 
  deleteUpdate 
} from '../controllers/financialSourceUpdate.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest, financialSourceUpdateSchemas } from '../utils/validators';

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

// Financial source update routes
router.route('/')
  .get(getUpdates)
  .post(validateRequest(financialSourceUpdateSchemas.create), createUpdate);

router.route('/:updateId')
  .get(getUpdate)
  .patch(validateRequest(financialSourceUpdateSchemas.update), updateUpdate)
  .delete(deleteUpdate);

export default router;
