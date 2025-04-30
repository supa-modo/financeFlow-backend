import express from 'express';
import { register, login, logout, getCurrentUser, updatePassword } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest, authSchemas } from '../utils/validators';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(authSchemas.register), register);
router.post('/login', validateRequest(authSchemas.login), login);
router.get('/logout', logout);

// Protected routes
router.use(protect);
router.get('/me', getCurrentUser);
router.patch('/update-password', validateRequest(authSchemas.updatePassword), updatePassword);

export default router;
