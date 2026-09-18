import express from 'express';
import { protectRestaurant } from '../../middleware/authMiddleware.js';
import {
  getRestaurantOrders,
  getRestaurantOrderById,
  updateRestaurantOrderStatus
} from '../../controllers/orders/restaurantOrderController.js';

const router = express.Router();

router.use(protectRestaurant);

router.get('/', getRestaurantOrders);
router.get('/:id', getRestaurantOrderById);
router.patch('/:id/status', updateRestaurantOrderStatus);

export default router;
