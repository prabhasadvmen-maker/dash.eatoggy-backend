import * as checkoutService from '../../services/cart/checkoutService.js';

const getCustomerId = (req) => {
  return req.customer?.id || req.customer?._id || req.user?.id || req.user?._id;
};

/**
 * @desc    Get customer addresses
 * @route   GET /api/customers/addresses
 * @access  Private (Customer)
 */
export const getAddresses = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }

    const addresses = await checkoutService.getAddresses(customerId);
    res.status(200).json({
      success: true,
      message: 'Addresses fetched successfully',
      data: addresses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add new customer delivery address
 * @route   POST /api/customers/addresses
 * @access  Private (Customer)
 */
export const addAddress = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }

    const { name, mobile, addressLine1, city, state, pincode } = req.body;
    if (!name || !mobile || !addressLine1 || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile, addressLine1, city, and pincode are required'
      });
    }

    const address = await checkoutService.createAddress(customerId, req.body);
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Delete customer delivery address
 * @route   DELETE /api/customers/addresses/:id
 * @access  Private (Customer)
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized customer access' });
    }

    const { id } = req.params;
    const result = await checkoutService.deleteAddress(customerId, id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
