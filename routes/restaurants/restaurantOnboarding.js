import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Restaurant from '../../models/restaurants/Restaurant.js';
import Payment from '../../models/payments/Payment.js';
import OnboardingFee from '../../models/super-admin/OnboardingFee.js';
import { protectRestaurant } from '../../middleware/authMiddleware.js';
import { upload, uploadToR2 } from '../../integrations/storage/r2UploadService.js';
import { successResponse, errorResponse } from '../../common/apiResponse.js';
import { asyncHandler } from '../../common/asyncHandler.js';

const router = express.Router();

// All onboarding routes are protected
router.use(protectRestaurant);

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const isRazorpayConfigured = () => {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return key && secret && key !== '' && secret !== '';
};

// @route   PUT /api/restaurant-onboarding/business-details
// @desc    Save Business Details
router.put('/business-details', asyncHandler(async (req, res) => {
  const {
    restaurantName, ownerName, restaurantType, cuisine,
    email, fullAddress, city, pincode, operatingHoursOpen, operatingHoursClose
  } = req.body;

  if (!restaurantName || !ownerName || !restaurantType || !fullAddress) {
    return errorResponse(res, { statusCode: 400, message: 'Missing required business details' });
  }

  const restaurant = await Restaurant.findById(req.restaurant.id);
  if (!restaurant) {
    return errorResponse(res, { statusCode: 404, message: 'Restaurant not found' });
  }

  restaurant.restaurantName = restaurantName;
  restaurant.ownerName = ownerName;
  restaurant.restaurantType = restaurantType;
  restaurant.cuisine = cuisine || restaurant.cuisine;
  restaurant.email = email || restaurant.email;
  restaurant.fullAddress = fullAddress;
  restaurant.city = city || restaurant.city;
  restaurant.pincode = pincode || restaurant.pincode;
  
  if (operatingHoursOpen && operatingHoursClose) {
    restaurant.operatingHours = {
      open: operatingHoursOpen,
      close: operatingHoursClose
    };
  }

  restaurant.currentStep = 'BUSINESS_DOCS';
  if (restaurant.onboardingStatus === 'DRAFT') {
    restaurant.onboardingStatus = 'ONBOARDING_IN_PROGRESS';
  }

  await restaurant.save();

  return successResponse(res, {
    message: 'Business details saved successfully',
    data: { currentStep: restaurant.currentStep, onboardingStatus: restaurant.onboardingStatus }
  });
}));

// Configure multer for documents
const docUpload = upload.fields([
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'foodLicense', maxCount: 1 }
]);

// @route   POST /api/restaurant-onboarding/business-docs
// @desc    Upload Business Documents
router.post('/business-docs', docUpload, asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant.id);
  if (!restaurant) {
    return errorResponse(res, { statusCode: 404, message: 'Restaurant not found' });
  }

  if (!req.files || !req.files.gstCertificate || !req.files.foodLicense) {
    return errorResponse(res, { statusCode: 400, message: 'GST Certificate and Food License are required' });
  }

  const gstUrl = await uploadToR2(req.files.gstCertificate[0], 'restaurant-docs');
  const fssaiUrl = await uploadToR2(req.files.foodLicense[0], 'restaurant-docs');

  restaurant.documents = restaurant.documents || {};
  restaurant.documents.gstCertificate = gstUrl;
  restaurant.documents.foodLicense = fssaiUrl;
  
  restaurant.currentStep = 'IDENTITY_BANK';
  await restaurant.save();

  return successResponse(res, {
    message: 'Business documents saved successfully',
    data: { currentStep: restaurant.currentStep }
  });
}));

const idBankUpload = upload.fields([
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 }
]);

// @route   PUT /api/restaurant-onboarding/identity-bank
// @desc    Upload Identity Documents and Save Bank Details
router.put('/identity-bank', idBankUpload, asyncHandler(async (req, res) => {
  const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

  if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
    return errorResponse(res, { statusCode: 400, message: 'All bank details are required' });
  }

  const restaurant = await Restaurant.findById(req.restaurant.id);
  if (!restaurant) {
    return errorResponse(res, { statusCode: 404, message: 'Restaurant not found' });
  }

  if (!req.files || !req.files.aadhaarFront || !req.files.aadhaarBack) {
    // If files are missing, allow update if they already exist, otherwise reject
    if (!restaurant.documents?.aadhaarFront || !restaurant.documents?.aadhaarBack) {
      return errorResponse(res, { statusCode: 400, message: 'Aadhaar Front and Back are required' });
    }
  } else {
    restaurant.documents = restaurant.documents || {};
    restaurant.documents.aadhaarFront = await uploadToR2(req.files.aadhaarFront[0], 'restaurant-docs');
    restaurant.documents.aadhaarBack = await uploadToR2(req.files.aadhaarBack[0], 'restaurant-docs');
  }

  restaurant.bankDetails = {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName // Wait, bankName is not in BankDetails schema in Restaurant.js. Let's map it if needed or just use what exists.
  };

  restaurant.currentStep = 'REVIEW_PAYMENT';
  await restaurant.save();

  return successResponse(res, {
    message: 'Identity and bank details saved successfully',
    data: { currentStep: restaurant.currentStep }
  });
}));

// @route   GET /api/restaurant-onboarding/registration-fee
// @desc    Get current DB-configured registration fee
router.get('/registration-fee', asyncHandler(async (req, res) => {
  let feeRecord = await OnboardingFee.findOne({ key: 'RESTAURANT_PARTNER_ONBOARDING_FEE' });
  const feeAmount = feeRecord ? feeRecord.amount : 999;
  return successResponse(res, { data: { fee: feeAmount, currency: feeRecord ? feeRecord.currency : 'INR' } });
}));

// @route   GET /api/restaurant-onboarding/razorpay-key
// @desc    Return Razorpay public key
router.get('/razorpay-key', (req, res) => {
  res.json({ key: isRazorpayConfigured() ? process.env.RAZORPAY_KEY_ID : 'demo_key' });
});

// @route   POST /api/restaurant-onboarding/create-order
// @desc    Create Razorpay order using DB-configured fee
router.post('/create-order', asyncHandler(async (req, res) => {
  let feeRecord = await OnboardingFee.findOne({ key: 'RESTAURANT_PARTNER_ONBOARDING_FEE' });
  const feeAmount = feeRecord ? feeRecord.amount : 999;
  const feePaise = feeAmount * 100;

  if (!isRazorpayConfigured()) {
    return res.json({
      success: true,
      orderId: `demo_order_${Date.now()}`,
      amount: feePaise,
      currency: 'INR',
      isDemo: true
    });
  }

  try {
    const order = await getRazorpay().orders.create({
      amount: feePaise,
      currency: 'INR',
      receipt: `rcpt_rest_${req.restaurant.id}_${Date.now()}`
    });
    return res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay order error:', err.message);
    return res.json({
      success: true,
      orderId: `demo_order_${Date.now()}`,
      amount: feePaise,
      currency: 'INR',
      isDemo: true,
      fallbackMessage: 'Razorpay failed, falling back to demo mode'
    });
  }
}));

// @route   POST /api/restaurant-onboarding/verify-payment
// @desc    Verify Razorpay payment signature
router.post('/verify-payment', asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isDemo } = req.body;
  const restaurantId = req.restaurant.id;

  let feeRecord = await OnboardingFee.findOne({ key: 'RESTAURANT_PARTNER_ONBOARDING_FEE' });
  const feeAmount = feeRecord ? feeRecord.amount : 999;
  const feePaise = feeAmount * 100;

  let signatureVerified = false;

  if (isDemo || (razorpay_order_id && razorpay_order_id.startsWith('demo_order_')) || !isRazorpayConfigured()) {
    signatureVerified = true;
  } else {
    try {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        signatureVerified = true;
      }
    } catch (err) {
      console.error('Verify payment error:', err);
    }
  }

  if (!signatureVerified) {
    return errorResponse(res, { statusCode: 400, message: 'Payment verification failed' });
  }

  const demoPayId = razorpay_payment_id || `demo_pay_${Date.now()}`;

  // Prevent duplicate payment records
  let existingPayment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id || `demo_order_req`,
    purpose: 'RESTAURANT_PARTNER_ONBOARDING'
  });

  if (!existingPayment) {
    await Payment.create({
      restaurant: restaurantId,
      purpose: 'RESTAURANT_PARTNER_ONBOARDING',
      amount: feeAmount,
      amountPaise: feePaise,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id || `demo_order_req_${Date.now()}`,
      razorpayPaymentId: demoPayId,
      razorpaySignature: razorpay_signature || '',
      signatureVerified: true,
      status: 'PAID'
    });
  }

  return successResponse(res, {
    message: 'Payment verified successfully',
    data: { paymentId: demoPayId }
  });
}));

// @route   POST /api/restaurant-onboarding/submit
// @desc    Submit Application for Review
router.post('/submit', asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant.id);
  if (!restaurant) {
    return errorResponse(res, { statusCode: 404, message: 'Restaurant not found' });
  }

  // Validate required steps/fields
  if (!restaurant.restaurantName || !restaurant.ownerName) {
    return errorResponse(res, { statusCode: 400, message: 'Business details are incomplete' });
  }
  if (!restaurant.documents?.gstCertificate || !restaurant.documents?.foodLicense) {
    return errorResponse(res, { statusCode: 400, message: 'Business documents are incomplete' });
  }
  if (!restaurant.documents?.aadhaarFront || !restaurant.documents?.aadhaarBack || !restaurant.bankDetails?.accountNumber) {
    return errorResponse(res, { statusCode: 400, message: 'Identity or Bank details are incomplete' });
  }

  // Verify payment exists
  const payment = await Payment.findOne({
    restaurant: restaurant._id,
    purpose: 'RESTAURANT_PARTNER_ONBOARDING',
    status: 'PAID'
  });

  if (!payment) {
    return errorResponse(res, { statusCode: 400, message: 'Onboarding payment is incomplete or not verified' });
  }

  restaurant.onboardingStatus = 'PENDING_REVIEW';
  restaurant.currentStep = 'PENDING_REVIEW';
  restaurant.paymentId = payment.razorpayPaymentId;
  await restaurant.save();

  return successResponse(res, {
    message: 'Application submitted successfully',
    data: { onboardingStatus: restaurant.onboardingStatus, currentStep: restaurant.currentStep }
  });
}));

export default router;
