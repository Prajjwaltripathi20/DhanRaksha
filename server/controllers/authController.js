const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

// Default categories to create for new users
const defaultExpenseCategories = [
    { name: 'Food & Dining', color: '#EF4444', icon: 'utensils', isDefault: true },
    { name: 'Groceries', color: '#F59E0B', icon: 'shopping-cart', isDefault: true },
    { name: 'Transportation', color: '#3B82F6', icon: 'car', isDefault: true },
    { name: 'Traveling', color: '#06B6D4', icon: 'plane', isDefault: true },
    { name: 'Shopping', color: '#8B5CF6', icon: 'shopping-bag', isDefault: true },
    { name: 'Entertainment', color: '#EC4899', icon: 'film', isDefault: true },
    { name: 'Bills & Utilities', color: '#F97316', icon: 'zap', isDefault: true },
    { name: 'Healthcare', color: '#10B981', icon: 'heart', isDefault: true },
    { name: 'Education', color: '#6366F1', icon: 'graduation-cap', isDefault: true },
    { name: 'Rent', color: '#14B8A6', icon: 'home', isDefault: true },
    { name: 'Insurance', color: '#84CC16', icon: 'shield', isDefault: true },
    { name: 'Personal Care', color: '#D946EF', icon: 'user', isDefault: true },
    { name: 'Gifts', color: '#F43F5E', icon: 'gift', isDefault: true },
    { name: 'Other Expense', color: '#6B7280', icon: 'more-horizontal', isDefault: true },
];

const defaultIncomeCategories = [
    { name: 'Salary', color: '#10B981', icon: 'briefcase', isDefault: true },
    { name: 'Freelance', color: '#3B82F6', icon: 'laptop', isDefault: true },
    { name: 'Business', color: '#8B5CF6', icon: 'building', isDefault: true },
    { name: 'Investments', color: '#F59E0B', icon: 'trending-up', isDefault: true },
    { name: 'Rental Income', color: '#14B8A6', icon: 'home', isDefault: true },
    { name: 'Gifts Received', color: '#EC4899', icon: 'gift', isDefault: true },
    { name: 'Refunds', color: '#06B6D4', icon: 'refresh-cw', isDefault: true },
    { name: 'Other Income', color: '#6B7280', icon: 'more-horizontal', isDefault: true },
];

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            // Create default expense categories for the new user
            const expenseCategories = defaultExpenseCategories.map(cat => ({
                ...cat,
                user: user._id,
                type: 'expense'
            }));

            // Create default income categories for the new user
            const incomeCategories = defaultIncomeCategories.map(cat => ({
                ...cat,
                user: user._id,
                type: 'income'
            }));

            // Insert all default categories
            await Category.insertMany([...expenseCategories, ...incomeCategories]);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                currency: user.currency,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            currency: user.currency,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.currency = req.body.currency || user.currency;
            user.avatar = req.body.avatar || user.avatar;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                currency: updatedUser.currency,
                avatar: updatedUser.avatar
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
};
