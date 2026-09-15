import express from 'express';
import cors from 'cors';
import { env, logger } from './config/index.js';
import connectDB from './database/connection.js';
import authRoutes from './routes/auth/auth.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import restaurantAuthRoutes from './routes/restaurants/restaurantAuth.js';
import restaurantOnboardingRoutes from './routes/restaurants/restaurantOnboarding.js';
// import restaurantStaffRoutes from './routes/restaurants/restaurantStaff.js';
import restaurantMenuRoutes from './routes/restaurants/restaurantMenu.js';
import customerAuthRoutes from './routes/customers/customerAuth.js';
import deliveryAuthRoutes from './routes/delivery/deliveryAuth.js';
import deliveryOnboardingRoutes from './routes/delivery/deliveryOnboarding.js';
import superAdminDeliveryRoutes from './routes/super-admin/superAdminDelivery.js';
import superAdminRestaurantRoutes from './routes/super-admin/superAdminRestaurant.js';
import superAdminMenuRoutes from './routes/super-admin/superAdminMenu.js';
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
app.use('/api/restaurant-onboarding', restaurantOnboardingRoutes);
// app.use('/api/restaurants/staff', restaurantStaffRoutes);
app.use('/api/restaurants/menu', restaurantMenuRoutes);
app.use('/api/customer-auth', customerAuthRoutes);

// Delivery Partners Routes
app.use('/api/delivery-auth', deliveryAuthRoutes);
app.use('/api/delivery/onboarding', deliveryOnboardingRoutes);
app.use('/api/super-admin', superAdminDeliveryRoutes);
app.use('/api/super-admin/restaurant', superAdminRestaurantRoutes);
app.use('/api/super-admin/menu', superAdminMenuRoutes);

app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'You have access to protected data!', admin: req.admin });
});

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.PORT, () => logger.info(`Server running on port ${env.PORT}`));
});

