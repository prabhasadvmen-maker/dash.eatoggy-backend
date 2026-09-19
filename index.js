import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env, logger } from './config/index.js';
import connectDB from './database/connection.js';
import { initSocketServer } from './realtime/socketServer.js';
import authRoutes from './routes/auth/auth.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import restaurantAuthRoutes from './routes/restaurants/restaurantAuth.js';
import restaurantOnboardingRoutes from './routes/restaurants/restaurantOnboarding.js';
// import restaurantStaffRoutes from './routes/restaurants/restaurantStaff.js';
import restaurantMenuRoutes from './routes/restaurants/restaurantMenu.js';
import customerAuthRoutes from './routes/customers/customerAuth.js';
import customerDiscoveryRoutes from './routes/customers/customerDiscovery.js';
import customerCartRoutes from './routes/cart/cartRoutes.js';
import addressRoutes from './routes/customers/addressRoutes.js';
import checkoutRoutes from './routes/cart/checkoutRoutes.js';
import paymentRoutes from './routes/payments/paymentRoutes.js';
import customerOrderRoutes from './routes/orders/customerOrderRoutes.js';
import restaurantOrderRoutes from './routes/orders/restaurantOrderRoutes.js';
import kitchenOrderRoutes from './routes/orders/kitchenOrderRoutes.js';
import deliveryAuthRoutes from './routes/delivery/deliveryAuth.js';
import deliveryOnboardingRoutes from './routes/delivery/deliveryOnboarding.js';
import deliveryOrderRoutes from './routes/delivery/deliveryOrderRoutes.js';
import superAdminDeliveryRoutes from './routes/super-admin/superAdminDelivery.js';
import superAdminRestaurantRoutes from './routes/super-admin/superAdminRestaurant.js';
import superAdminMenuRoutes from './routes/super-admin/superAdminMenu.js';
import superAdminBannerRoutes from './routes/super-admin/superAdminBanners.js';
import subscriptionRoutes from './routes/subscriptions/subscriptionRoutes.js';
import { startSubscriptionSchedulerJob } from './jobs/subscriptionSchedulerJob.js';
import { protect } from './middleware/authMiddleware.js';
import requestIdMiddleware from './middleware/requestId.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO Server
initSocketServer(httpServer);

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
app.use('/api/customers/discovery', customerDiscoveryRoutes);
app.use('/api/customers/addresses', addressRoutes);
app.use('/api/cart', customerCartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers/orders', customerOrderRoutes);
app.use('/api/customers/orders', deliveryOrderRoutes);
app.use('/api/restaurants/orders', restaurantOrderRoutes);
app.use('/api/restaurant-admin/orders', restaurantOrderRoutes);
app.use('/api/restaurants/kitchen', kitchenOrderRoutes);
app.use('/api/restaurant-admin/kitchen', kitchenOrderRoutes);
app.use('/api', subscriptionRoutes);

// Delivery Partners Routes
app.use('/api/delivery-auth', deliveryAuthRoutes);
app.use('/api/delivery/onboarding', deliveryOnboardingRoutes);
app.use('/api/delivery', deliveryOrderRoutes);
app.use('/api/super-admin', superAdminDeliveryRoutes);
app.use('/api/super-admin/restaurant', superAdminRestaurantRoutes);
app.use('/api/super-admin/menu', superAdminMenuRoutes);
app.use('/api/super-admin/banners', superAdminBannerRoutes);

app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'You have access to protected data!', admin: req.admin });
});

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

connectDB().then(() => {
  httpServer.listen(env.PORT, () => {
    logger.info(`Server & Socket.IO running on port ${env.PORT}`);
    startSubscriptionSchedulerJob();
  });
});


