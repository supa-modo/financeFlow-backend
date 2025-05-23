import express from 'express';
import { register, login, logout, getCurrentUser, updatePassword, updateProfile, updateNotificationSettings, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { googleLogin, googleCallback, oauthSuccess, oauthFailure } from '../controllers/oauth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest, authSchemas } from '../utils/validators';
import passport from 'passport';
import '../config/passport'; // Import passport configuration

const router = express.Router();

// Public routes
router.post('/register', validateRequest(authSchemas.register), register);
router.post('/login', validateRequest(authSchemas.login), login);
router.get('/logout', logout);
router.post('/forgot-password', validateRequest(authSchemas.forgotPassword), forgotPassword);
router.post('/reset-password/:token', validateRequest(authSchemas.resetPassword), resetPassword);

// OAuth routes
// Google OAuth
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// OAuth failure route
router.get('/oauth-failure', oauthFailure);

// Protected routes
router.use(protect);
router.get('/me', getCurrentUser);
router.patch('/update-password', validateRequest(authSchemas.updatePassword), updatePassword);
router.patch('/update-profile', updateProfile);
router.patch('/update-notification-settings', updateNotificationSettings);

export default router;
