import express from 'express';
import { protectCustomer } from '../../middleware/authMiddleware.js';
import {
  getCustomerOrders,
  getCustomerOrderById
} from '../../controllers/orders/customerOrderController.js';

const router = express.Router();

router.use(protectCustomer);

router.get('/', getCustomerOrders);
router.get('/:id', getCustomerOrderById);

export default router;
