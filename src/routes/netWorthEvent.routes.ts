import express from 'express';
import { 
  createNetWorthEvent,
  getNetWorthEvents,
  getNetWorthEvent,
  deleteNetWorthEvent,
  getLatestNetWorth
} from '../controllers/netWorthEvent.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getNetWorthEvents)
  .post(createNetWorthEvent);

router.route('/latest')
  .get(getLatestNetWorth);

router.route('/:id')
  .get(getNetWorthEvent)
  .delete(deleteNetWorthEvent);

export default router;
