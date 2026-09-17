import Cart from '../../models/cart/Cart.js';
import MenuItem from '../../models/menu/MenuItem.js';
import Restaurant from '../../models/restaurants/Restaurant.js';
import Category from '../../models/menu/Category.js';
import Subcategory from '../../models/menu/Subcategory.js';

/**
 * Customer Cart Service
 * Handles persistence, price integrity, item validation, and restaurant isolation.
 */

// Helper to format cart response
const formatCartResponse = async (cart) => {
  if (!cart) {
    return {
      _id: null,
      customerId: null,
      restaurantId: null,
      restaurant: null,
      items: [],
      subtotal: 0
    };
  }

  let restaurantData = null;
  if (cart.restaurantId) {
    const restaurant = await Restaurant.findById(cart.restaurantId).select(
      'restaurantName restaurantType cuisine fullAddress city pincode documents status'
    );
    if (restaurant) {
      restaurantData = {
        _id: restaurant._id,
        restaurantName: restaurant.restaurantName,
        restaurantType: restaurant.restaurantType,
        cuisine: restaurant.cuisine,
        fullAddress: restaurant.fullAddress,
        city: restaurant.city,
        image: restaurant.documents?.restaurantImage || ''
      };
    }
  }

  return {
    _id: cart._id,
    customerId: cart.customerId,
    restaurantId: cart.restaurantId,
    restaurant: restaurantData,
    items: cart.items.map(item => ({
      _id: item._id,
      menuItemId: item.menuItemId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      itemSubtotal: item.itemSubtotal
    })),
    subtotal: cart.subtotal,
    updatedAt: cart.updatedAt
  };
};

/**
 * Get active cart for customer
 */
export const getCart = async (customerId) => {
  let cart = await Cart.findOne({ customerId });
  return await formatCartResponse(cart);
};

/**
 * Add an item to customer's cart
 */
export const addItem = async (customerId, menuItemId, quantity = 1) => {
  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    const error = new Error('Quantity must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch & Validate MenuItem
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }

  if (menuItem.status !== 'APPROVED') {
    const error = new Error(`Menu item is not approved for ordering (current status: ${menuItem.status})`);
    error.statusCode = 400;
    throw error;
  }

  if (!menuItem.availability) {
    const error = new Error('Menu item is currently unavailable');
    error.statusCode = 400;
    throw error;
  }

  // 2. Fetch & Validate Restaurant
  const restaurant = await Restaurant.findById(menuItem.restaurantId);
  if (!restaurant || restaurant.status !== 'APPROVED') {
    const error = new Error('Restaurant is not approved or available');
    error.statusCode = 400;
    throw error;
  }

  // 3. Fetch & Validate Category and Subcategory
  const category = await Category.findById(menuItem.categoryId);
  if (!category || !category.isActive) {
    const error = new Error('Item category is currently inactive');
    error.statusCode = 400;
    throw error;
  }

  const subcategory = await Subcategory.findById(menuItem.subcategoryId);
  if (!subcategory || !subcategory.isActive) {
    const error = new Error('Item subcategory is currently inactive');
    error.statusCode = 400;
    throw error;
  }

  // 4. Find existing customer cart or initialize new one
  let cart = await Cart.findOne({ customerId });

  if (!cart) {
    cart = new Cart({
      customerId,
      restaurantId: menuItem.restaurantId,
      items: [],
      subtotal: 0
    });
  }

  // 5. Enforce Single-Restaurant Rule
  if (cart.items.length > 0 && cart.restaurantId.toString() !== menuItem.restaurantId.toString()) {
    const error = new Error('Your cart contains items from another restaurant. Clear your cart to add items from this restaurant.');
    error.statusCode = 400;
    error.code = 'DIFFERENT_RESTAURANT_CART';
    throw error;
  }

  // 6. Server-Side Price Calculation
  const serverPrice = menuItem.price;
  const existingItemIndex = cart.items.findIndex(
    item => item.menuItemId.toString() === menuItemId.toString()
  );

  if (existingItemIndex > -1) {
    const existingItem = cart.items[existingItemIndex];
    existingItem.quantity += parsedQuantity;
    existingItem.price = serverPrice; // ensure snapshot price matches current DB price
    existingItem.itemSubtotal = existingItem.quantity * serverPrice;
  } else {
    cart.items.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      image: menuItem.image || '',
      price: serverPrice,
      quantity: parsedQuantity,
      itemSubtotal: parsedQuantity * serverPrice
    });
  }

  cart.restaurantId = menuItem.restaurantId;
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemSubtotal, 0);

  await cart.save();
  return await formatCartResponse(cart);
};

/**
 * Update item quantity in cart
 */
export const updateItemQuantity = async (customerId, menuItemId, quantity) => {
  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity)) {
    const error = new Error('Valid quantity is required');
    error.statusCode = 400;
    throw error;
  }

  if (parsedQuantity <= 0) {
    return await removeItem(customerId, menuItemId);
  }

  let cart = await Cart.findOne({ customerId });
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  const itemIndex = cart.items.findIndex(
    item => item.menuItemId.toString() === menuItemId.toString()
  );

  if (itemIndex === -1) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  // Re-verify MenuItem availability & current server price
  const menuItem = await MenuItem.findById(menuItemId);
  if (menuItem) {
    if (menuItem.status !== 'APPROVED' || !menuItem.availability) {
      // Remove item if no longer available or approved
      cart.items.splice(itemIndex, 1);
      if (cart.items.length === 0) {
        cart.restaurantId = null;
        cart.subtotal = 0;
      } else {
        cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemSubtotal, 0);
      }
      await cart.save();
      const error = new Error('Item is no longer available and was removed from cart');
      error.statusCode = 400;
      throw error;
    }
    cart.items[itemIndex].price = menuItem.price;
  }

  const item = cart.items[itemIndex];
  item.quantity = parsedQuantity;
  item.itemSubtotal = item.quantity * item.price;

  cart.subtotal = cart.items.reduce((sum, i) => sum + i.itemSubtotal, 0);
  await cart.save();

  return await formatCartResponse(cart);
};

/**
 * Remove an item from cart
 */
export const removeItem = async (customerId, menuItemId) => {
  let cart = await Cart.findOne({ customerId });
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    item => item.menuItemId.toString() !== menuItemId.toString()
  );

  if (cart.items.length === initialLength) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  if (cart.items.length === 0) {
    cart.restaurantId = null;
    cart.subtotal = 0;
  } else {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemSubtotal, 0);
  }

  await cart.save();
  return await formatCartResponse(cart);
};

/**
 * Clear customer cart completely
 */
export const clearCart = async (customerId) => {
  let cart = await Cart.findOne({ customerId });
  if (cart) {
    cart.items = [];
    cart.restaurantId = null;
    cart.subtotal = 0;
    await cart.save();
  }
  return await formatCartResponse(cart);
};
