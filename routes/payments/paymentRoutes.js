import express from 'express';
import { protectCustomer } from '../../middleware/authMiddleware.js';
import {
  createOrderPaymentOrder,
  verifyOrderPayment
} from '../../controllers/payments/paymentController.js';

const router = express.Router();

router.use(protectCustomer);

router.post('/create-order-payment', createOrderPaymentOrder);
router.post('/verify-order-payment', verifyOrderPayment);

export default router;
