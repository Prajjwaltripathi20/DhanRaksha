const Budget = require('../models/Budget');

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
    try {
        const { isActive, period } = req.query;
        const query = { user: req.user._id };

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (period) {
            query.period = period;
        }

        const budgets = await Budget.find(query)
            .populate('category', 'name icon color')
            .sort({ createdAt: -1 });

        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id)
            .populate('category', 'name icon color');

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Check ownership
        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
    try {
        const { category, amount, period, startDate, endDate, alertThreshold } = req.body;

        // Validation
        if (!category || !amount || !startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if budget already exists for this category and period
        const existingBudget = await Budget.findOne({
            user: req.user._id,
            category,
            isActive: true,
            $or: [
                { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
            ]
        });

        if (existingBudget) {
            return res.status(400).json({
                message: 'A budget already exists for this category in the specified period'
            });
        }

        const budget = await Budget.create({
            user: req.user._id,
            category,
            amount,
            period,
            startDate,
            endDate,
            alertThreshold
        });

        const populatedBudget = await Budget.findById(budget._id)
            .populate('category', 'name icon color');

        res.status(201).json(populatedBudget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Check ownership
        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedBudget = await Budget.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category', 'name icon color');

        res.json(updatedBudget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Check ownership
        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await budget.deleteOne();

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget
};
