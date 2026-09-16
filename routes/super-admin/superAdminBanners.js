import express from 'express';
import { protectSuperAdmin } from '../../middleware/authMiddleware.js';
import { upload } from '../../services/r2UploadService.js';
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} from '../../controllers/super-admin/superAdminBannerController.js';

const router = express.Router();

// Protect all Super Admin banner routes
router.use(protectSuperAdmin);

// ==========================================
// BANNER ROUTES
// ==========================================
router.post('/', upload.single('image'), createBanner);
router.get('/', getBanners);
router.get('/:id', getBannerById);
router.put('/:id', upload.single('image'), updateBanner);
router.delete('/:id', deleteBanner);
router.patch('/:id/status', toggleBannerStatus);

export default router;
