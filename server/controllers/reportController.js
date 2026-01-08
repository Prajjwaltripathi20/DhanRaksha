const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Budget = require('../models/Budget');

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get total balance from all accounts
        const accounts = await Account.find({ user: userId, isActive: true });
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        // Get this month's income and expenses
        const monthTransactions = await Transaction.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        let monthIncome = 0;
        let monthExpense = 0;

        monthTransactions.forEach(item => {
            if (item._id === 'income') monthIncome = item.total;
            if (item._id === 'expense') monthExpense = item.total;
        });

        // Get recent transactions
        const recentTransactions = await Transaction.find({ user: userId })
            .populate('category', 'name icon color')
            .populate('account', 'name type')
            .sort({ date: -1 })
            .limit(5);

        // Get budget status
        const budgets = await Budget.find({
            user: userId,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate('category', 'name icon color');

        res.json({
            totalBalance,
            monthIncome,
            monthExpense,
            monthSavings: monthIncome - monthExpense,
            recentTransactions,
            budgets,
            accounts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get spending by category
// @route   GET /api/reports/spending-by-category
// @access  Private
const getSpendingByCategory = async (req, res) => {
    try {
        const { startDate, endDate, type = 'expense' } = req.query;
        const userId = req.user._id;

        const matchQuery = {
            user: userId,
            type
        };

        if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate) matchQuery.date.$gte = new Date(startDate);
            if (endDate) matchQuery.date.$lte = new Date(endDate);
        }

        const categoryData = await Transaction.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $project: {
                    _id: 1,
                    total: 1,
                    count: 1,
                    name: '$categoryInfo.name',
                    icon: '$categoryInfo.icon',
                    color: '$categoryInfo.color'
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        const totalAmount = categoryData.reduce((sum, item) => sum + item.total, 0);

        // Add percentage to each category
        const dataWithPercentage = categoryData.map(item => ({
            ...item,
            percentage: totalAmount > 0 ? (item.total / totalAmount) * 100 : 0
        }));

        res.json({
            categories: dataWithPercentage,
            total: totalAmount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly trend
// @route   GET /api/reports/monthly-trend
// @access  Private
const getMonthlyTrend = async (req, res) => {
    try {
        const { months = 6 } = req.query;
        const userId = req.user._id;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        const trendData = await Transaction.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Format data for chart
        const formattedData = {};

        trendData.forEach(item => {
            const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;

            if (!formattedData[key]) {
                formattedData[key] = {
                    month: key,
                    income: 0,
                    expense: 0
                };
            }

            if (item._id.type === 'income') {
                formattedData[key].income = item.total;
            } else {
                formattedData[key].expense = item.total;
            }
        });

        const result = Object.values(formattedData).map(item => ({
            ...item,
            savings: item.income - item.expense
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get account balances over time
// @route   GET /api/reports/account-balances
// @access  Private
const getAccountBalances = async (req, res) => {
    try {
        const userId = req.user._id;

        const accounts = await Account.find({ user: userId, isActive: true });

        // Get transaction history for each account to calculate balance over time
        const accountData = await Promise.all(
            accounts.map(async (account) => {
                const transactions = await Transaction.find({
                    user: userId,
                    account: account._id
                }).sort({ date: 1 });

                let runningBalance = 0;
                const balanceHistory = transactions.map(tx => {
                    if (tx.type === 'income') {
                        runningBalance += tx.amount;
                    } else {
                        runningBalance -= tx.amount;
                    }

                    return {
                        date: tx.date,
                        balance: runningBalance
                    };
                });

                return {
                    _id: account._id,
                    name: account.name,
                    type: account.type,
                    currentBalance: account.balance,
                    color: account.color,
                    balanceHistory
                };
            })
        );

        res.json(accountData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get budget performance
// @route   GET /api/reports/budget-performance
// @access  Private
const getBudgetPerformance = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const budgets = await Budget.find({
            user: userId,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate('category', 'name icon color');

        const budgetPerformance = budgets.map(budget => ({
            _id: budget._id,
            category: budget.category,
            amount: budget.amount,
            spent: budget.spent,
            remaining: budget.remaining,
            percentageUsed: budget.percentageUsed,
            period: budget.period,
            startDate: budget.startDate,
            endDate: budget.endDate,
            alertThreshold: budget.alertThreshold,
            isOverBudget: budget.spent > budget.amount,
            isNearLimit: budget.percentageUsed >= budget.alertThreshold
        }));

        res.json(budgetPerformance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    getSpendingByCategory,
    getMonthlyTrend,
    getAccountBalances,
    getBudgetPerformance
};
