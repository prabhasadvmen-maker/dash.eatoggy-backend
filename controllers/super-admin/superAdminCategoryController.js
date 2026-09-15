import Category from '../../models/menu/Category.js';
import Subcategory from '../../models/menu/Subcategory.js';

// ==========================================
// CATEGORY CONTROLLERS
// ==========================================

export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive, sortOrder } = req.body;
    
    // Prevent duplicates
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
      createdBy: req.admin.id
    });

    await category.save();
    res.status(201).json({ message: 'Category created successfully', data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { isActive, search } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
      
    res.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
      
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ data: category });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Category not found' });
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    
    // Check if duplicate name exists for another category
    if (name) {
      const existing = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, 
        _id: { $ne: req.params.id } 
      });
      if (existing) {
        return res.status(400).json({ message: 'Another category with this name already exists' });
      }
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    category.updatedBy = req.admin.id;

    await category.save();
    res.json({ message: 'Category updated successfully', data: category });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Category not found' });
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive status is required' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = isActive;
    category.updatedBy = req.admin.id;
    await category.save();

    // If deactivating category, optionally deactivate its subcategories?
    // As per requirement: "Deactivate instead of deleting. Before deactivating a Category... do not silently invent a cascade rule."
    // Safest behavior: If category is inactive, subcategories remain untouched in DB but logically might not be shown to users later.
    // If we wanted to cascade, we would do it here. For now, we just deactivate the category itself.

    res.json({ message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`, data: category });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Category not found' });
    console.error('Error toggling category status:', error);
    res.status(500).json({ message: 'Failed to toggle category status' });
  }
};


// ==========================================
// SUBCATEGORY CONTROLLERS
// ==========================================

export const createSubcategory = async (req, res) => {
  try {
    const { categoryId, name, description, isActive, sortOrder } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ message: 'Parent category ID is required' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Parent category not found' });
    }

    // Prevent duplicates in same category
    const existing = await Subcategory.findOne({ 
      categoryId, 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Subcategory with this name already exists in this category' });
    }

    const subcategory = new Subcategory({
      categoryId,
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
      createdBy: req.admin.id
    });

    await subcategory.save();
    res.status(201).json({ message: 'Subcategory created successfully', data: subcategory });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid category ID format' });
    console.error('Error creating subcategory:', error);
    res.status(500).json({ message: 'Failed to create subcategory', error: error.message });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const { isActive, search, categoryId } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const subcategories = await Subcategory.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate('categoryId', 'name isActive')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
      
    res.json({ data: subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Failed to fetch subcategories' });
  }
};

export const getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id)
      .populate('categoryId', 'name isActive')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
      
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    res.json({ data: subcategory });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Subcategory not found' });
    console.error('Error fetching subcategory:', error);
    res.status(500).json({ message: 'Failed to fetch subcategory' });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { categoryId, name, description, sortOrder } = req.body;
    
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    const targetCategoryId = categoryId || subcategory.categoryId;
    
    if (categoryId && categoryId !== subcategory.categoryId.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }

    // Check duplicate name in target category
    if (name || categoryId) {
      const targetName = name || subcategory.name;
      const existing = await Subcategory.findOne({ 
        categoryId: targetCategoryId,
        name: { $regex: new RegExp(`^${targetName}$`, 'i') }, 
        _id: { $ne: req.params.id } 
      });
      if (existing) {
        return res.status(400).json({ message: 'Another subcategory with this name already exists in the target category' });
      }
    }

    if (categoryId) subcategory.categoryId = categoryId;
    if (name) subcategory.name = name;
    if (description !== undefined) subcategory.description = description;
    if (sortOrder !== undefined) subcategory.sortOrder = sortOrder;
    subcategory.updatedBy = req.admin.id;

    await subcategory.save();
    res.json({ message: 'Subcategory updated successfully', data: subcategory });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid ID format' });
    console.error('Error updating subcategory:', error);
    res.status(500).json({ message: 'Failed to update subcategory', error: error.message });
  }
};

export const toggleSubcategoryStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive status is required' });
    }

    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    subcategory.isActive = isActive;
    subcategory.updatedBy = req.admin.id;
    await subcategory.save();

    res.json({ message: `Subcategory ${isActive ? 'activated' : 'deactivated'} successfully`, data: subcategory });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Subcategory not found' });
    console.error('Error toggling subcategory status:', error);
    res.status(500).json({ message: 'Failed to toggle subcategory status' });
  }
};
