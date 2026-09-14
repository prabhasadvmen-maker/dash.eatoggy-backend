import express from 'express';
import {
  sendOtp,
  verifyOtp,
  login,
  getMe
} from '../../controllers/delivery/deliveryAuthController.js';
import { protectDeliveryPartner } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/me', protectDeliveryPartner, getMe);

export default router;
