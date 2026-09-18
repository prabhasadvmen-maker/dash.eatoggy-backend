import * as orderService from '../../services/orders/orderService.js';
import { successResponse, errorResponse } from '../../common/apiResponse.js';

const getCustomerId = (req) => {
  return req.customer?.id || req.customer?._id || req.user?.id || req.user?._id;
};

/**
 * @desc    Get Customer Orders History
 * @route   GET /api/customers/orders
 * @access  Private (Customer)
 */
export const getCustomerOrders = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return errorResponse(res, { statusCode: 401, message: 'Unauthorized customer access' });
    }

    const orders = await orderService.getCustomerOrders(customerId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Customer orders retrieved successfully',
      data: orders
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Get Single Customer Order Details
 * @route   GET /api/customers/orders/:id
 * @access  Private (Customer)
 */
export const getCustomerOrderById = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return errorResponse(res, { statusCode: 401, message: 'Unauthorized customer access' });
    }

    const { id } = req.params;
    const order = await orderService.getCustomerOrderById(customerId, id);

    return successResponse(res, {
      statusCode: 200,
      message: 'Order details retrieved successfully',
      data: order
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};
