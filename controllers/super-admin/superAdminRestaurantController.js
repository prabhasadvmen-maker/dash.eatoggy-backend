import OnboardingFee from '../../models/super-admin/OnboardingFee.js';
import AuditLog from '../../models/super-admin/AuditLog.js';
import { successResponse, errorResponse } from '../../common/apiResponse.js';
import { asyncHandler } from '../../common/asyncHandler.js';

/**
 * @desc    Get Current Active Onboarding Fee Setting for Restaurant
 * @route   GET /api/super-admin/restaurant/onboarding-fee
 * @access  Protected (SuperAdmin JWT)
 */
export const getFeeSetting = asyncHandler(async (req, res) => {
  let fee = await OnboardingFee.findOne({ key: 'RESTAURANT_PARTNER_ONBOARDING_FEE' });
  if (!fee) {
    fee = await OnboardingFee.create({
      key: 'RESTAURANT_PARTNER_ONBOARDING_FEE',
      amount: 999, // default initial value
      currency: 'INR'
    });
  }

  return successResponse(res, {
    message: 'Onboarding fee setting retrieved',
    data: { fee }
  });
});

/**
 * @desc    Update Onboarding Fee Setting for Restaurant
 * @route   PUT /api/super-admin/restaurant/onboarding-fee
 * @access  Protected (SuperAdmin JWT)
 */
export const updateFeeSetting = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const adminId = req.admin?.id;

  if (amount === undefined || isNaN(amount) || Number(amount) < 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Valid non-negative fee amount is required'
    });
  }

  let fee = await OnboardingFee.findOne({ key: 'RESTAURANT_PARTNER_ONBOARDING_FEE' });
  const oldAmount = fee ? fee.amount : 999;

  if (!fee) {
    fee = new OnboardingFee({ key: 'RESTAURANT_PARTNER_ONBOARDING_FEE' });
  }

  fee.amount = Number(amount);
  fee.currency = 'INR';
  fee.updatedBy = adminId;
  await fee.save();

  // Audit Log
  await AuditLog.create({
    action: 'RESTAURANT_ONBOARDING_FEE_UPDATED',
    performedBy: adminId,
    targetId: fee._id,
    targetModel: 'OnboardingFee',
    details: { oldAmount, newAmount: fee.amount }
  });

  return successResponse(res, {
    message: 'Onboarding fee updated successfully',
    data: { fee }
  });
});
