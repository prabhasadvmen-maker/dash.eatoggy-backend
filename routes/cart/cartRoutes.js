import express from 'express';
import { protectCustomer } from '../../middleware/authMiddleware.js';
import {
  getCart,
  addItem,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../../controllers/cart/cartController.js';

const router = express.Router();

// All cart routes require Customer authentication
router.use(protectCustomer);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.route('/items')
  .post(addItem);

router.route('/items/:itemId')
  .patch(updateCartItem)
  .delete(removeCartItem);

export default router;
