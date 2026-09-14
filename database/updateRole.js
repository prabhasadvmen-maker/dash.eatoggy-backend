import mongoose from 'mongoose';
import { env, validateEnv, logger } from '../config/index.js';

validateEnv();

mongoose.connect(env.MONGODB_URI).then(async () => {
  await mongoose.connection.collection('admins').updateOne(
    { email: 'superadmin@eatoggy.com' },
    { $set: { role: 'SuperAdmin' } }
  );
  logger.info('Done');
  process.exit(0);
}).catch((err) => {
  logger.error('updateRole connection error:', err.message);
  process.exit(1);
});
