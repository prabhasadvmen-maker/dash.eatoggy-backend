import express from 'express';
import cors from 'cors';
import { env, logger } from './config/index.js';
import connectDB from './database/connection.js';
import authRoutes from './routes/auth/auth.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import restaurantAuthRoutes from './routes/restaurants/restaurantAuth.js';
import { protect } from './middleware/authMiddleware.js';
import requestIdMiddleware from './middleware/requestId.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(requestIdMiddleware);
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/restaurant-auth', restaurantAuthRoutes);

app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'You have access to protected data!', admin: req.admin });
});

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.PORT, () => logger.info(`Server running on port ${env.PORT}`));
});
