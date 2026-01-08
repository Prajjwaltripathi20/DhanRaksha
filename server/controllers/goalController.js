const Goal = require('../models/Goal');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = { user: req.user._id };

        if (status === 'active') {
            filter.isCompleted = false;
        } else if (status === 'completed') {
            filter.isCompleted = true;
        }

        const goals = await Goal.find(filter).sort({ deadline: 1 });

        // Calculate totals
        const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

        res.json({
            goals,
            totalTarget,
            totalSaved,
            overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
    try {
        const goal = await Goal.create({
            ...req.body,
            user: req.user._id
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            goal[key] = req.body[key];
        });

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
            goal.isCompleted = true;
            goal.completedAt = new Date();
        }

        await goal.save();
        res.json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add money to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Please provide a valid amount' });
        }

        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        goal.currentAmount += amount;

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
            goal.isCompleted = true;
            goal.completedAt = new Date();
        }

        await goal.save();
        res.json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    contributeToGoal,
    deleteGoal
};
