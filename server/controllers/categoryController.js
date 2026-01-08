const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const { type, isActive } = req.query;
        const query = { user: req.user._id };

        if (type) query.type = type;
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const categories = await Category.find(query).sort({ name: 1 });

        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check ownership
        if (category.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    try {
        const { name, type, icon, color } = req.body;

        // Validation
        if (!name || !type) {
            return res.status(400).json({ message: 'Please provide name and type' });
        }

        // Check if category with same name exists
        const existingCategory = await Category.findOne({
            user: req.user._id,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            type
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }

        const category = await Category.create({
            user: req.user._id,
            name,
            type,
            icon,
            color
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check ownership
        if (category.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Prevent updating default categories
        if (category.isDefault) {
            return res.status(400).json({ message: 'Cannot update default categories' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check ownership
        if (category.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Prevent deleting default categories
        if (category.isDefault) {
            return res.status(400).json({ message: 'Cannot delete default categories' });
        }

        // Check if category has transactions
        const transactionCount = await Transaction.countDocuments({ category: req.params.id });
        if (transactionCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete category with existing transactions. Please delete or reassign transactions first.'
            });
        }

        await category.deleteOne();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
