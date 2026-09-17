import * as checkoutService from '../../services/cart/checkoutService.js';

const getCustomerId = (req) => {
  return req.customer?.id || req.customer?._id || req.user?.id || req.user?._id;
};

/**
 * @desc    Get server-calculated checkout summary & bill breakdown
 * @route   GET /api/checkout/summary
 * @access  Private (Customer)
 */
export const getCheckoutSummary = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }

    const { addressId } = req.query;
    const summary = await checkoutService.getCheckoutSummary(customerId, addressId || null);

    res.status(200).json({
      success: true,
      message: 'Checkout summary calculated successfully',
      data: summary
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Initiate checkout session with server-calculated price breakdown
 * @route   POST /api/checkout/initiate
 * @access  Private (Customer)
 */
export const initiateCheckout = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }

    const { addressId } = req.body;
    const session = await checkoutService.initiateCheckout(customerId, { addressId });

    res.status(200).json({
      success: true,
      message: 'Checkout session initiated successfully',
      data: session
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
