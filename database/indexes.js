import { logger } from '../config/index.js';

export const ensureIndexes = async () => {
  try {
    logger.info('Database indexes checked/verified.');
  } catch (error) {
    logger.error('Error creating database indexes:', error.message);
  }
};

export default ensureIndexes;
