const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Budget = require('../models/Budget');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { type, category, account, startDate, endDate, limit = 50, page = 1 } = req.query;

        // Build query
        const query = { user: req.user._id };

        if (type) query.type = type;
        if (category) query.category = category;
        if (account) query.account = account;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query)
            .populate('category', 'name icon color')
            .populate('account', 'name type')
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('category', 'name icon color')
            .populate('account', 'name type');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check ownership
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    try {
        const { type, category, account, amount, description, date, tags, isRecurring, recurringFrequency } = req.body;

        // Validation
        if (!type || !category || !account || !amount) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Create transaction
        const transaction = await Transaction.create({
            user: req.user._id,
            type,
            category,
            account,
            amount,
            description,
            date: date || Date.now(),
            tags,
            isRecurring,
            recurringFrequency
        });

        // Update account balance
        const accountDoc = await Account.findById(account);
        if (accountDoc) {
            if (type === 'income') {
                accountDoc.balance += amount;
            } else {
                accountDoc.balance -= amount;
            }
            await accountDoc.save();
        }

        // Update budget spent amount if expense
        if (type === 'expense') {
            const budget = await Budget.findOne({
                user: req.user._id,
                category,
                isActive: true,
                startDate: { $lte: date || Date.now() },
                endDate: { $gte: date || Date.now() }
            });

            if (budget) {
                budget.spent += amount;
                await budget.save();
            }
        }

        const populatedTransaction = await Transaction.findById(transaction._id)
            .populate('category', 'name icon color')
            .populate('account', 'name type');

        res.status(201).json(populatedTransaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check ownership
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Store old values for account balance adjustment
        const oldAmount = transaction.amount;
        const oldType = transaction.type;
        const oldAccount = transaction.account;

        // Update transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category', 'name icon color')
            .populate('account', 'name type');

        // Adjust account balances
        if (oldAccount.toString() === updatedTransaction.account._id.toString()) {
            // Same account
            const accountDoc = await Account.findById(oldAccount);
            if (accountDoc) {
                // Reverse old transaction
                if (oldType === 'income') {
                    accountDoc.balance -= oldAmount;
                } else {
                    accountDoc.balance += oldAmount;
                }
                // Apply new transaction
                if (updatedTransaction.type === 'income') {
                    accountDoc.balance += updatedTransaction.amount;
                } else {
                    accountDoc.balance -= updatedTransaction.amount;
                }
                await accountDoc.save();
            }
        } else {
            // Different accounts
            const oldAccountDoc = await Account.findById(oldAccount);
            const newAccountDoc = await Account.findById(updatedTransaction.account);

            if (oldAccountDoc) {
                // Reverse old transaction
                if (oldType === 'income') {
                    oldAccountDoc.balance -= oldAmount;
                } else {
                    oldAccountDoc.balance += oldAmount;
                }
                await oldAccountDoc.save();
            }

            if (newAccountDoc) {
                // Apply new transaction
                if (updatedTransaction.type === 'income') {
                    newAccountDoc.balance += updatedTransaction.amount;
                } else {
                    newAccountDoc.balance -= updatedTransaction.amount;
                }
                await newAccountDoc.save();
            }
        }

        res.json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check ownership
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update account balance
        const accountDoc = await Account.findById(transaction.account);
        if (accountDoc) {
            if (transaction.type === 'income') {
                accountDoc.balance -= transaction.amount;
            } else {
                accountDoc.balance += transaction.amount;
            }
            await accountDoc.save();
        }

        // Update budget spent amount if expense
        if (transaction.type === 'expense') {
            const budget = await Budget.findOne({
                user: req.user._id,
                category: transaction.category,
                isActive: true,
                startDate: { $lte: transaction.date },
                endDate: { $gte: transaction.date }
            });

            if (budget) {
                budget.spent -= transaction.amount;
                await budget.save();
            }
        }

        await transaction.deleteOne();

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchQuery = { user: req.user._id };
        if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate) matchQuery.date.$gte = new Date(startDate);
            if (endDate) matchQuery.date.$lte = new Date(endDate);
        }

        const stats = await Transaction.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            income: 0,
            expense: 0,
            incomeCount: 0,
            expenseCount: 0
        };

        stats.forEach(stat => {
            if (stat._id === 'income') {
                result.income = stat.total;
                result.incomeCount = stat.count;
            } else {
                result.expense = stat.total;
                result.expenseCount = stat.count;
            }
        });

        result.balance = result.income - result.expense;

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
};
