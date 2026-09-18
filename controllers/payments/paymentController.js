import * as paymentService from '../../services/payments/paymentService.js';
import { successResponse, errorResponse } from '../../common/apiResponse.js';

const getCustomerId = (req) => {
  return req.customer?.id || req.customer?._id || req.user?.id || req.user?._id;
};

/**
 * @desc    Create Razorpay Order Payment Order
 * @route   POST /api/payments/create-order-payment
 * @access  Private (Customer)
 */
export const createOrderPaymentOrder = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return errorResponse(res, { statusCode: 401, message: 'Unauthorized customer access' });
    }

    const { sessionId } = req.body;
    const paymentData = await paymentService.createOrderPaymentOrder(customerId, sessionId);

    return successResponse(res, {
      statusCode: 200,
      message: 'Order payment initialized successfully',
      data: paymentData
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Verify Razorpay Signature & Idempotently Create Order
 * @route   POST /api/payments/verify-order-payment
 * @access  Private (Customer)
 */
export const verifyOrderPayment = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return errorResponse(res, { statusCode: 401, message: 'Unauthorized customer access' });
    }

    const result = await paymentService.verifyOrderPayment(customerId, req.body);

    return successResponse(res, {
      statusCode: 200,
      message: result.message,
      data: {
        payment: result.payment,
        order: result.order
      }
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};
