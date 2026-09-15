import express from 'express';
import { protectSuperAdmin } from '../../middleware/authMiddleware.js';
import {
  getFeeSetting,
  updateFeeSetting,
} from '../../controllers/super-admin/superAdminRestaurantController.js';

const router = express.Router();

// Protect all Super Admin restaurant routes
router.use(protectSuperAdmin);

router.get('/onboarding-fee', getFeeSetting);
router.put('/onboarding-fee', updateFeeSetting);

export default router;
