import express from 'express';
import { protectSuperAdmin } from '../../middleware/authMiddleware.js';
import {
  getDeliveryPartners,
  getDeliveryPartnerById,
  approveDeliveryPartner,
  rejectDeliveryPartner,
  getFeeSetting,
  updateFeeSetting,
} from '../../controllers/super-admin/superAdminDeliveryController.js';

const router = express.Router();

// Protect all Super Admin delivery routes
router.use(protectSuperAdmin);

router.get('/delivery-partners', getDeliveryPartners);
router.get('/delivery-partners/:id', getDeliveryPartnerById);
router.patch('/delivery-partners/:id/approve', approveDeliveryPartner);
router.patch('/delivery-partners/:id/reject', rejectDeliveryPartner);

router.get('/onboarding-fee', getFeeSetting);
router.put('/onboarding-fee', updateFeeSetting);

export default router;

