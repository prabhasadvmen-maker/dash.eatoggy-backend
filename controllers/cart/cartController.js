import * as cartService from '../../services/cart/cartService.js';

const getCustomerId = (req) => {
  return req.customer?.id || req.customer?._id || req.user?.id || req.user?._id;
};

/**
 * @desc    Get customer cart
 * @route   GET /api/cart
 * @access  Private (Customer)
 */
export const getCart = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }
    const cart = await cartService.getCart(customerId);
    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private (Customer)
 */
export const addItem = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }
    const { menuItemId, quantity } = req.body;
    if (!menuItemId) {
      return res.status(400).json({ success: false, message: 'menuItemId is required' });
    }

    const cart = await cartService.addItem(customerId, menuItemId, quantity || 1);
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code || null
      });
    }
    next(err);
  }
};

/**
 * @desc    Update item quantity in cart
 * @route   PATCH /api/cart/items/:itemId
 * @access  Private (Customer)
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }
    const { itemId } = req.params; // itemId can be menuItemId or cart item _id
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ success: false, message: 'quantity is required' });
    }

    const cart = await cartService.updateItemQuantity(customerId, itemId, quantity);
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private (Customer)
 */
export const removeCartItem = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }
    const { itemId } = req.params;

    const cart = await cartService.removeItem(customerId, itemId);
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

/**
 * @desc    Clear customer cart
 * @route   DELETE /api/cart
 * @access  Private (Customer)
 */
export const clearCart = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }

    const cart = await cartService.clearCart(customerId);
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};
