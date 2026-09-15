import MenuItem from '../../models/menu/MenuItem.js';

// @desc    Get pending menu items for verification
export const getPendingMenuItems = async (req, res) => {
  try {
    const { status, restaurantId } = req.query;
    
    // Default to PENDING_REVIEW if no status is specified
    const query = { status: status || 'PENDING_REVIEW' };
    
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const items = await MenuItem.find(query)
      .populate('restaurantId', 'businessDetails.restaurantName')
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ submittedAt: 1 });

    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching pending menu items:', error);
    res.status(500).json({ message: 'Failed to fetch pending menu items' });
  }
};

// @desc    Get detailed info of a menu item for verification
export const getMenuItemDetails = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('restaurantId', 'businessDetails.restaurantName contactInfo')
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name');

    if (!item) {
      return res.status(404).json({ message: 'Menu Item not found' });
    }

    res.json({ data: item });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Menu Item not found' });
    console.error('Error fetching menu item details:', error);
    res.status(500).json({ message: 'Failed to fetch menu item details' });
  }
};

// @desc    Approve menu item
export const approveMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Menu Item not found' });
    }

    if (item.status === 'APPROVED') {
      return res.status(400).json({ message: 'Menu Item is already approved' });
    }

    item.status = 'APPROVED';
    item.rejectionReason = undefined;
    item.reviewedAt = new Date();
    item.reviewedBy = req.admin.id;
    item.updatedBy = req.admin.id;
    item.updatedByType = 'Admin';

    await item.save();

    res.json({ message: 'Menu Item approved successfully', data: item });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Menu Item not found' });
    console.error('Error approving menu item:', error);
    res.status(500).json({ message: 'Failed to approve menu item' });
  }
};

// @desc    Reject menu item
export const rejectMenuItem = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Menu Item not found' });
    }

    item.status = 'REJECTED';
    item.rejectionReason = rejectionReason;
    item.reviewedAt = new Date();
    item.reviewedBy = req.admin.id;
    item.updatedBy = req.admin.id;
    item.updatedByType = 'Admin';

    await item.save();

    res.json({ message: 'Menu Item rejected successfully', data: item });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Menu Item not found' });
    console.error('Error rejecting menu item:', error);
    res.status(500).json({ message: 'Failed to reject menu item' });
  }
};
