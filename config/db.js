import { env } from './env.js';

export const dbConfig = {
  uri: env.MONGODB_URI,
  options: {}
};
