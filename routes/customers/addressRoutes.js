import express from 'express';
import { protectCustomer } from '../../middleware/authMiddleware.js';
import {
  getAddresses,
  addAddress,
  deleteAddress
} from '../../controllers/customers/addressController.js';

const router = express.Router();

router.use(protectCustomer);

router.route('/')
  .get(getAddresses)
  .post(addAddress);

router.route('/:id')
  .delete(deleteAddress);

export default router;
