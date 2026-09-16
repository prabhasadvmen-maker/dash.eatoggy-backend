import express from 'express';
import { protectSuperAdmin } from '../../middleware/authMiddleware.js';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  toggleSubcategoryStatus,
  deleteCategory,
  deleteSubcategory
} from '../../controllers/super-admin/superAdminCategoryController.js';
import {
  getPendingMenuItems,
  getMenuItemDetails,
  approveMenuItem,
  rejectMenuItem
} from '../../controllers/super-admin/superAdminMenuVerificationController.js';

const router = express.Router();

// Protect all Super Admin menu routes
router.use(protectSuperAdmin);

// ==========================================
// CATEGORY ROUTES
// ==========================================
router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.put('/categories/:id', updateCategory);
router.patch('/categories/:id/status', toggleCategoryStatus);
router.delete('/categories/:id', deleteCategory);

// ==========================================
// SUBCATEGORY ROUTES
// ==========================================
router.post('/subcategories', createSubcategory);
router.get('/subcategories', getSubcategories);
router.get('/subcategories/:id', getSubcategoryById);
router.put('/subcategories/:id', updateSubcategory);
router.patch('/subcategories/:id/status', toggleSubcategoryStatus);
router.delete('/subcategories/:id', deleteSubcategory);

// ==========================================
// MENU VERIFICATION ROUTES
// ==========================================
router.get('/verification/items', getPendingMenuItems);
router.get('/verification/items/:id', getMenuItemDetails);
router.patch('/verification/items/:id/approve', approveMenuItem);
router.patch('/verification/items/:id/reject', rejectMenuItem);

export default router;
