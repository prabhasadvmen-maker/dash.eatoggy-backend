import Order from '../../models/orders/Order.js';
import Payment from '../../models/payments/Payment.js';
import CheckoutSession from '../../models/cart/CheckoutSession.js';
import Address from '../../models/customers/Address.js';
import Cart from '../../models/cart/Cart.js';
import MenuItem from '../../models/menu/MenuItem.js';
import { createDeliveryForOrder } from '../delivery/deliveryService.js';

/**
 * Idempotently Create Order from Verified Payment
 */
export const createOrderFromPayment = async (paymentId) => {
  // 1. Check idempotency: If Order already exists for this paymentId, return it
  const existingOrder = await Order.findOne({ paymentId })
    .populate('restaurantId', 'restaurantName city rating documents.restaurantImage cuisine')
    .populate('customerId', 'fullName mobile email');

  if (existingOrder) {
    return existingOrder;
  }

  // 2. Fetch Payment record
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.status !== 'PAID') {
    const error = new Error('Valid paid payment record is required to create order');
    error.statusCode = 400;
    throw error;
  }

  // 3. Fetch CheckoutSession
  const session = await CheckoutSession.findById(payment.checkoutSession);
  if (!session) {
    const error = new Error('Associated checkout session not found');
    error.statusCode = 404;
    throw error;
  }

  // 4. Fetch Selected Address
  const address = await Address.findById(session.addressId);
  const addressSnapshot = address
    ? {
        name: address.name,
        mobile: address.mobile,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        pincode: address.pincode,
        label: address.label || 'Home'
      }
    : {
        name: 'Customer',
        mobile: '0000000000',
        addressLine1: 'Default Address',
        addressLine2: '',
        city: 'Delhi NCR',
        pincode: '110001',
        label: 'Home'
      };

  // 5. Build Item Snapshots
  const itemSnapshots = [];
  for (const item of session.items) {
    let foodType = 'VEG';
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (menuItem && menuItem.foodType) {
      foodType = menuItem.foodType;
    }

    itemSnapshots.push({
      menuItemId: item.menuItemId,
      foodNameSnapshot: item.name,
      foodImageSnapshot: item.image || (menuItem ? menuItem.image : ''),
      unitPrice: item.price,
      quantity: item.quantity,
      itemTotal: item.itemSubtotal,
      foodType: foodType
    });
  }

  // 6. Build Pricing Snapshot
  const pricingSnapshot = {
    itemSubtotal: session.itemSubtotal,
    packagingFee: session.packagingFee,
    deliveryFee: session.deliveryFee,
    tax: session.tax,
    platformFee: session.platformFee,
    discount: session.discount || 0,
    grandTotal: session.grandTotal
  };

  // 7. Generate Unique Order Number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-${dateStr}-${randomDigits}`;

  // 8. Create Order Document
  const order = new Order({
    orderNumber,
    customerId: payment.customer,
    restaurantId: session.restaurantId,
    items: itemSnapshots,
    deliveryAddress: addressSnapshot,
    pricing: pricingSnapshot,
    paymentId: payment._id,
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    orderStatus: 'PLACED',
    statusHistory: [
      {
        status: 'PLACED',
        timestamp: new Date(),
        updatedBy: 'CUSTOMER',
        note: 'Order placed successfully after payment verification'
      }
    ]
  });

  await order.save();

  // Initialize Delivery record for P4 assignment
  try {
    await createDeliveryForOrder(order._id);
  } catch (err) {
    console.error('Error initializing delivery record for order:', err);
  }

  // 9. Mark CheckoutSession EXPIRED & Clear Customer Cart
  session.status = 'EXPIRED';
  await session.save();

  await Cart.findOneAndDelete({ customerId: payment.customer });

  // 10. Return Populated Order
  return await Order.findById(order._id)
    .populate('restaurantId', 'restaurantName city rating documents.restaurantImage cuisine')
    .populate('customerId', 'fullName mobile email');
};

/**
 * Get Customer Orders History
 */
export const getCustomerOrders = async (customerId) => {
  return await Order.find({ customerId })
    .sort({ createdAt: -1 })
    .populate('restaurantId', 'restaurantName city rating documents.restaurantImage cuisine')
    .populate('customerId', 'fullName mobile email');
};

/**
 * Get Single Customer Order by ID (with Ownership Isolation)
 */
export const getCustomerOrderById = async (customerId, orderId) => {
  const order = await Order.findById(orderId)
    .populate('restaurantId', 'restaurantName city rating documents.restaurantImage cuisine address phone')
    .populate('customerId', 'fullName mobile email');

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.customerId._id.toString() !== customerId.toString()) {
    const error = new Error('Unauthorized access to order details');
    error.statusCode = 403;
    throw error;
  }

  return order;
};

/**
 * Get Restaurant Orders List (with Optional Status Filter)
 */
export const getRestaurantOrders = async (restaurantId, statusFilter = null) => {
  const query = { restaurantId };
  if (statusFilter && statusFilter !== 'ALL') {
    query.orderStatus = statusFilter;
  }

  return await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('customerId', 'fullName mobile email')
    .populate('restaurantId', 'restaurantName');
};

/**
 * Get Single Restaurant Order by ID (with Ownership Isolation)
 */
export const getRestaurantOrderById = async (restaurantId, orderId) => {
  const order = await Order.findById(orderId)
    .populate('customerId', 'fullName mobile email')
    .populate('restaurantId', 'restaurantName');

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.restaurantId._id.toString() !== restaurantId.toString()) {
    const error = new Error('Unauthorized access to restaurant order');
    error.statusCode = 403;
    throw error;
  }

  return order;
};

/**
 * Update Restaurant Order Status with State Machine Validation
 */
export const updateRestaurantOrderStatus = async (restaurantId, orderId, newStatus, reason = '') => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.restaurantId.toString() !== restaurantId.toString()) {
    const error = new Error('Unauthorized access to update restaurant order');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = order.orderStatus;

  // State Machine Transition Rules
  const validTransitions = {
    PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    REJECTED: [],
    CANCELLED: []
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    const error = new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    error.statusCode = 400;
    throw error;
  }

  if (newStatus === 'REJECTED' && (!reason || reason.trim() === '')) {
    const error = new Error('Rejection reason is required when rejecting an order');
    error.statusCode = 400;
    throw error;
  }

  order.orderStatus = newStatus;
  if (reason) {
    order.rejectionReason = reason;
  }

  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: 'RESTAURANT',
    note: reason || `Order status updated to ${newStatus}`
  });

  await order.save();

  return await Order.findById(order._id)
    .populate('customerId', 'fullName mobile email')
    .populate('restaurantId', 'restaurantName');
};
