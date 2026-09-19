import { asyncHandler } from '../../common/asyncHandler.js';
import { successResponse } from '../../common/apiResponse.js';
import subscriptionService from '../../services/subscriptions/subscriptionService.js';

/**
 * @desc    Trigger Background Job Scheduler Run
 * @route   POST /api/subscriptions/scheduler/run
 * @access  Protected (System / Admin)
 */
export const runScheduler = asyncHandler(async (req, res) => {
  const { targetDate } = req.body || {};
  const dateInput = targetDate ? new Date(targetDate) : new Date();

  const result = await subscriptionService.runSubscriptionScheduler(dateInput);

  return successResponse(res, {
    message: 'Subscription job scheduler executed successfully',
    data: result
  });
});

export default {
  runScheduler
};
