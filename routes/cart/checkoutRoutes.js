import express from 'express';
import { protectCustomer } from '../../middleware/authMiddleware.js';
import {
  getCheckoutSummary,
  initiateCheckout
} from '../../controllers/cart/checkoutController.js';

const router = express.Router();

router.use(protectCustomer);

router.get('/summary', getCheckoutSummary);
router.post('/initiate', initiateCheckout);

export default router;
