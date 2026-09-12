import express from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Restaurant from '../models/Restaurant.js';
import { protect } from '../middleware/authMiddleware.js';
import { getPresignedDocumentUrls } from '../services/r2UploadService.js';

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// @route   GET /api/admins
// @desc    Get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admins
// @desc    Create a new admin
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let admin = await Admin.findOne({ email });

    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role
    });

    await admin.save();
    
    // Return admin without password
    const adminObj = admin.toObject();
    delete adminObj.password;
    
    res.json(adminObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admins/:id
// @desc    Delete an admin
router.delete('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.admin.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admins/:id
// @desc    Update an admin
router.put('/:id', async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    let admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if email is being updated to an existing one
    if (email && email !== admin.email) {
      let emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;
    
    // Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();
    
    // Return updated admin without password
    const adminObj = admin.toObject();
    delete adminObj.password;
    
    res.json(adminObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admins/:id/toggle-status
// @desc    Toggle admin active status
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin._id.toString() === req.admin.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();
    
    // Return the updated user without password
    const adminObj = admin.toObject();
    delete adminObj.password;

    res.json(adminObj);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admins/restaurants
// @desc    Get all restaurants (for SuperAdmin review)
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({}).sort({ createdAt: -1 });
    const formattedRestaurants = await Promise.all(
      restaurants.map(async (r) => {
        const rObj = r.toObject();
        if (rObj.documents) {
          rObj.documents = await getPresignedDocumentUrls(rObj.documents);
        }
        return rObj;
      })
    );
    res.json(formattedRestaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admins/restaurants/:id/approve
// @desc    Approve a restaurant application
router.put('/restaurants/:id/approve', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    restaurant.status = 'APPROVED';
    restaurant.rejectionReason = '';
    await restaurant.save();
    
    res.json({ message: 'Restaurant approved successfully', restaurant });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admins/restaurants/:id/reject
// @desc    Reject a restaurant application
router.put('/restaurants/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    restaurant.status = 'REJECTED';
    restaurant.rejectionReason = reason;
    await restaurant.save();
    
    res.json({ message: 'Restaurant rejected', restaurant });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admins/restaurants/:id
// @desc    Delete a restaurant
router.delete('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admins/restaurants/:id/toggle-status
// @desc    Toggle Enable/Disable (APPROVED / SUSPENDED) for a restaurant
router.put('/restaurants/:id/toggle-status', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    if (restaurant.status === 'APPROVED') {
      restaurant.status = 'SUSPENDED';
      restaurant.suspensionReason = 'Disabled by Administrator';
    } else {
      restaurant.status = 'APPROVED';
      restaurant.suspensionReason = '';
    }
    
    await restaurant.save();
    res.json({ message: `Restaurant ${restaurant.status === 'APPROVED' ? 'Enabled' : 'Disabled'} successfully`, restaurant });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;


