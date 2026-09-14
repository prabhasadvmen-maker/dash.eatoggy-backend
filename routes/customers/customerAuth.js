import express from 'express';
import {
  signup,
  sendOtp,
  verifyOtp,
  login,
  getMe
} from '../../controllers/customers/customerAuthController.js';
import { protectCustomer } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

// Protected routes (Customer JWT required)
router.get('/me', protectCustomer, getMe);

export default router;
