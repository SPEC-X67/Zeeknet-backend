import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { OtpController } from '../controllers/otp.controller';

export function createAuthRouter(
  authController: AuthController,
  otpController: OtpController,
): Router {
  const router = Router();
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/admin-login', authController.adminLogin);
  router.post('/login/google', authController.googleLogin);
  router.post('/refresh', authController.refresh);
  router.post('/logout', authController.logout);
  router.get('/check-auth', authenticateToken, authController.checkAuth);
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);
  router.post('/otp-request', otpController.request);
  router.post('/otp-verify', otpController.verify);
  return router;
}
