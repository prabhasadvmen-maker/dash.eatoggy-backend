import express from 'express';
import { protectRestaurant } from '../../middleware/authMiddleware.js';
import {
  getKitchenOrders,
  updateKitchenOrderStatus
} from '../../controllers/orders/restaurantOrderController.js';

const router = express.Router();

router.use(protectRestaurant);

// GET /api/restaurants/kitchen/orders AND GET /api/restaurants/kitchen
router.get('/orders', getKitchenOrders);
router.get('/', getKitchenOrders);

// PATCH /api/restaurants/kitchen/orders/:id/status AND PATCH /api/restaurants/kitchen/:id/status
router.patch('/orders/:id/status', updateKitchenOrderStatus);
router.patch('/:id/status', updateKitchenOrderStatus);

export default router;
