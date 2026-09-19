import { asyncHandler } from '../../common/asyncHandler.js';
import { successResponse, errorResponse } from '../../common/apiResponse.js';
import subscriptionService from '../../services/subscriptions/subscriptionService.js';

/**
 * @desc    Get Public Tiffin Plans (Discovery)
 * @route   GET /api/customers/tiffin-plans
 * @access  Public
 */
export const getPublicPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.getPublicTiffinPlans(req.query);
  return successResponse(res, {
    message: 'Tiffin plans retrieved successfully',
    data: { plans }
  });
});

/**
 * @desc    Get Single Tiffin Plan Details
 * @route   GET /api/customers/tiffin-plans/:id
 * @access  Public
 */
export const getPlanDetail = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.getTiffinPlanById(req.params.id);
  return successResponse(res, {
    message: 'Tiffin plan details retrieved',
    data: { plan }
  });
});

/**
 * @desc    Initiate Subscription Checkout & Create Razorpay Payment Order
 * @route   POST /api/customers/subscriptions
 * @access  Protected (Customer JWT)
 */
export const createSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const { planId, addressId, startDate, scheduleDays } = req.body;

  if (!planId || !addressId) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'planId and addressId are required'
    });
  }

  const result = await subscriptionService.createSubscriptionCheckout({
    customerId,
    planId,
    addressId,
    startDate,
    scheduleDays
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Subscription created and payment order generated successfully',
    data: result
  });
});

/**
 * @desc    Verify Razorpay Signature & Activate Subscription
 * @route   POST /api/customers/subscriptions/verify-payment
 * @access  Protected (Customer JWT)
 */
export const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const { subscriptionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if ((!razorpay_order_id && !subscriptionId) || !razorpay_payment_id || !razorpay_signature) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'razorpay_order_id (or subscriptionId), razorpay_payment_id, and razorpay_signature are required'
    });
  }

  const result = await subscriptionService.verifySubscriptionPayment({
    customerId,
    subscriptionId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  });

  return successResponse(res, {
    message: 'Subscription payment verified and subscription activated successfully',
    data: result
  });
});

/**
 * @desc    Get Authenticated Customer's Subscriptions List
 * @route   GET /api/customers/subscriptions
 * @access  Protected (Customer JWT)
 */
export const getMySubscriptions = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const subscriptions = await subscriptionService.getCustomerSubscriptions(customerId);
  return successResponse(res, {
    message: 'Customer subscriptions retrieved',
    data: { subscriptions }
  });
});

/**
 * @desc    Get Single Subscription Details with Upcoming Occurrences Timeline
 * @route   GET /api/customers/subscriptions/:id
 * @access  Protected (Customer JWT)
 */
export const getSubscriptionDetail = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const result = await subscriptionService.getSubscriptionById(req.params.id, customerId);
  return successResponse(res, {
    message: 'Subscription detail retrieved',
    data: result
  });
});

/**
 * @desc    Pause Subscription
 * @route   PATCH /api/customers/subscriptions/:id/pause
 * @access  Protected (Customer JWT)
 */
export const pauseSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const subscription = await subscriptionService.pauseSubscription(req.params.id, customerId);
  return successResponse(res, {
    message: 'Subscription paused successfully',
    data: { subscription }
  });
});

/**
 * @desc    Resume Subscription
 * @route   PATCH /api/customers/subscriptions/:id/resume
 * @access  Protected (Customer JWT)
 */
export const resumeSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const subscription = await subscriptionService.resumeSubscription(req.params.id, customerId);
  return successResponse(res, {
    message: 'Subscription resumed successfully',
    data: { subscription }
  });
});

/**
 * @desc    Cancel Subscription
 * @route   PATCH /api/customers/subscriptions/:id/cancel
 * @access  Protected (Customer JWT)
 */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const subscription = await subscriptionService.cancelSubscription(req.params.id, customerId);
  return successResponse(res, {
    message: 'Subscription cancelled successfully',
    data: { subscription }
  });
});

/**
 * @desc    Skip Upcoming Occurrence
 * @route   POST /api/customers/subscriptions/:id/occurrences/:occId/skip
 * @access  Protected (Customer JWT)
 */
export const skipOccurrence = asyncHandler(async (req, res) => {
  const customerId = req.user?.id || req.customer?.id;
  const occurrence = await subscriptionService.skipOccurrence(req.params.id, req.params.occId, customerId);
  return successResponse(res, {
    message: 'Subscription occurrence skipped successfully',
    data: { occurrence }
  });
});

export default {
  getPublicPlans,
  getPlanDetail,
  createSubscription,
  verifySubscriptionPayment,
  getMySubscriptions,
  getSubscriptionDetail,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  skipOccurrence
};
