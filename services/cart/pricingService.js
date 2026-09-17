import MenuItem from '../../models/menu/MenuItem.js';
import Restaurant from '../../models/restaurants/Restaurant.js';
import Category from '../../models/menu/Category.js';
import Subcategory from '../../models/menu/Subcategory.js';

/**
 * Server-Side Pricing Engine
 * Audits, validates, and calculates all financial amounts for customer checkout.
 * MANDATORY SECURITY RULE: Client-supplied prices, subtotals, or fees are strictly IGNORED.
 */

export const calculateCheckoutPricing = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    const error = new Error('Cart is empty. Add items to checkout.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify Restaurant Eligibility & Status
  const restaurant = await Restaurant.findById(cart.restaurantId);
  if (!restaurant || restaurant.status !== 'APPROVED') {
    const error = new Error('Restaurant is not approved or active');
    error.statusCode = 400;
    throw error;
  }

  // 2. Re-validate each cart item against DB for status, availability, and active categories
  const validatedItems = [];
  let itemSubtotalSum = 0;

  for (const item of cart.items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (!menuItem) {
      const error = new Error(`Item "${item.name || 'Menu item'}" no longer exists`);
      error.statusCode = 400;
      throw error;
    }

    if (menuItem.status !== 'APPROVED') {
      const error = new Error(`Item "${menuItem.name}" is no longer approved for ordering`);
      error.statusCode = 400;
      throw error;
    }

    if (!menuItem.availability) {
      const error = new Error(`Item "${menuItem.name}" is currently out of stock / unavailable`);
      error.statusCode = 400;
      throw error;
    }

    const category = await Category.findById(menuItem.categoryId);
    if (!category || !category.isActive) {
      const error = new Error(`Category for item "${menuItem.name}" is currently inactive`);
      error.statusCode = 400;
      throw error;
    }

    const subcategory = await Subcategory.findById(menuItem.subcategoryId);
    if (!subcategory || !subcategory.isActive) {
      const error = new Error(`Subcategory for item "${menuItem.name}" is currently inactive`);
      error.statusCode = 400;
      throw error;
    }

    // Authoritative Server DB Price
    const dbPrice = menuItem.price;
    const itemSubtotal = item.quantity * dbPrice;
    itemSubtotalSum += itemSubtotal;

    validatedItems.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      image: menuItem.image || '',
      price: dbPrice,
      quantity: item.quantity,
      itemSubtotal
    });
  }

  // 3. Pricing Rule Calculations
  const itemSubtotal = Math.round(itemSubtotalSum * 100) / 100;
  const packagingFee = 20; // Standard flat packaging charge ₹20
  const freeDeliveryThreshold = 500;
  const isFreeDelivery = itemSubtotal >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 35; // ₹35 or Free above ₹500
  const platformFee = 5; // Standard platform fee ₹5

  // 5% GST calculated on food + packaging
  const taxableAmount = itemSubtotal + packagingFee;
  const tax = Math.round(taxableAmount * 0.05 * 100) / 100;
  const discount = 0; // Future coupon/discount engine integration point

  const grandTotal = Math.round((itemSubtotal + packagingFee + deliveryFee + tax + platformFee - discount) * 100) / 100;

  return {
    restaurantId: restaurant._id,
    restaurantName: restaurant.restaurantName,
    items: validatedItems,
    itemSubtotal,
    packagingFee,
    deliveryFee,
    freeDeliveryThreshold,
    isFreeDelivery,
    tax,
    taxRate: '5% GST',
    platformFee,
    discount,
    grandTotal
  };
};
