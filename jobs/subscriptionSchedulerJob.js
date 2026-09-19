import subscriptionService from '../services/subscriptions/subscriptionService.js';
import { logger } from '../config/index.js';

let intervalId = null;

export const startSubscriptionSchedulerJob = (intervalMs = 60000) => {
  if (intervalId) return;

  logger.info('[Subscription Scheduler] Starting background job...');

  // Run initial scheduler check on boot
  subscriptionService.runSubscriptionScheduler().catch((err) => {
    logger.error('[Subscription Scheduler] Initial run error:', err.message || err);
  });

  // Schedule recurring check
  intervalId = setInterval(async () => {
    try {
      await subscriptionService.runSubscriptionScheduler();
    } catch (err) {
      logger.error('[Subscription Scheduler] Recurring run error:', err.message || err);
    }
  }, intervalMs);
};

export const stopSubscriptionSchedulerJob = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('[Subscription Scheduler] Stopped background job.');
  }
};

export default {
  startSubscriptionSchedulerJob,
  stopSubscriptionSchedulerJob
};
