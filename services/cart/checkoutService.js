import Address from '../../models/customers/Address.js';
import Cart from '../../models/cart/Cart.js';
import CheckoutSession from '../../models/cart/CheckoutSession.js';
import { calculateCheckoutPricing } from './pricingService.js';

/**
 * Customer Checkout Service
 * Manages Customer Delivery Addresses, Checkout Previews, and Checkout Sessions.
 */

// --- ADDRESS OPERATIONS ---

export const getAddresses = async (customerId) => {
  return await Address.find({ customerId }).sort({ isDefault: -1, createdAt: -1 });
};

export const createAddress = async (customerId, addressData) => {
  const existingCount = await Address.countDocuments({ customerId });
  if (existingCount === 0) {
    addressData.isDefault = true;
  } else if (addressData.isDefault) {
    await Address.updateMany({ customerId }, { isDefault: false });
  }

  const address = new Address({
    ...addressData,
    customerId
  });

  return await address.save();
};

export const deleteAddress = async (customerId, addressId) => {
  const address = await Address.findOneAndDelete({ _id: addressId, customerId });
  if (!address) {
    const error = new Error('Address not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  // If deleted address was default, promote latest remaining address to default
  if (address.isDefault) {
    const latest = await Address.findOne({ customerId }).sort({ createdAt: -1 });
    if (latest) {
      latest.isDefault = true;
      await latest.save();
    }
  }

  return { success: true, message: 'Address deleted successfully' };
};

// --- CHECKOUT OPERATIONS ---

export const getCheckoutSummary = async (customerId, addressId = null) => {
  // 1. Fetch active customer cart
  const cart = await Cart.findOne({ customerId });
  if (!cart || !cart.items || cart.items.length === 0) {
    const error = new Error('Cart is empty. Add items to checkout.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Fetch Selected / Default Address
  let selectedAddress = null;
  if (addressId) {
    selectedAddress = await Address.findOne({ _id: addressId, customerId });
    if (!selectedAddress) {
      const error = new Error('Selected delivery address not found');
      error.statusCode = 400;
      throw error;
    }
  } else {
    selectedAddress = await Address.findOne({ customerId, isDefault: true });
    if (!selectedAddress) {
      selectedAddress = await Address.findOne({ customerId }).sort({ createdAt: -1 });
    }
  }

  // 3. Run Server-Side Pricing Engine
  const pricing = await calculateCheckoutPricing(cart);

  return {
    ...pricing,
    selectedAddress
  };
};

export const initiateCheckout = async (customerId, { addressId }) => {
  if (!addressId) {
    const error = new Error('Delivery address is required for checkout');
    error.statusCode = 400;
    throw error;
  }

  const summary = await getCheckoutSummary(customerId, addressId);
  if (!summary.selectedAddress) {
    const error = new Error('Valid delivery address is required for checkout');
    error.statusCode = 400;
    throw error;
  }

  // Persist or update Checkout Session
  let session = await CheckoutSession.findOne({ customerId, status: 'DRAFT' });
  if (!session) {
    session = new CheckoutSession({
      customerId,
      restaurantId: summary.restaurantId,
      addressId: summary.selectedAddress._id,
      items: summary.items,
      itemSubtotal: summary.itemSubtotal,
      packagingFee: summary.packagingFee,
      deliveryFee: summary.deliveryFee,
      tax: summary.tax,
      platformFee: summary.platformFee,
      discount: summary.discount,
      grandTotal: summary.grandTotal,
      status: 'READY_FOR_PAYMENT'
    });
  } else {
    session.restaurantId = summary.restaurantId;
    session.addressId = summary.selectedAddress._id;
    session.items = summary.items;
    session.itemSubtotal = summary.itemSubtotal;
    session.packagingFee = summary.packagingFee;
    session.deliveryFee = summary.deliveryFee;
    session.tax = summary.tax;
    session.platformFee = summary.platformFee;
    session.discount = summary.discount;
    session.grandTotal = summary.grandTotal;
    session.status = 'READY_FOR_PAYMENT';
  }

  await session.save();

  return {
    sessionId: session._id,
    checkout: summary,
    status: session.status
  };
};
