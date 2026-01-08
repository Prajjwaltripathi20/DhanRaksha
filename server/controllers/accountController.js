const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get all accounts
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res) => {
    try {
        const { isActive } = req.query;
        const query = { user: req.user._id };

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const accounts = await Account.find(query).sort({ createdAt: -1 });

        // Calculate total balance
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

        res.json({
            accounts,
            totalBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
const getAccount = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Check ownership
        if (account.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create account
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res) => {
    try {
        const { name, type, balance, currency, color, icon, description } = req.body;

        // Validation
        if (!name || !type) {
            return res.status(400).json({ message: 'Please provide name and type' });
        }

        const account = await Account.create({
            user: req.user._id,
            name,
            type,
            balance: balance || 0,
            currency,
            color,
            icon,
            description
        });

        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private
const updateAccount = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Check ownership
        if (account.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedAccount = await Account.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedAccount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Check ownership
        if (account.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if account has transactions
        const transactionCount = await Transaction.countDocuments({ account: req.params.id });
        if (transactionCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete account with existing transactions. Please delete or reassign transactions first.'
            });
        }

        await account.deleteOne();

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Transfer between accounts
// @route   POST /api/accounts/transfer
// @access  Private
const transferBetweenAccounts = async (req, res) => {
    try {
        const { fromAccountId, toAccountId, amount, description } = req.body;

        // Validation
        if (!fromAccountId || !toAccountId || !amount) {
            return res.status(400).json({ message: 'Please provide from account, to account, and amount' });
        }

        if (fromAccountId === toAccountId) {
            return res.status(400).json({ message: 'Cannot transfer to the same account' });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // Get both accounts
        const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user._id });
        const toAccount = await Account.findOne({ _id: toAccountId, user: req.user._id });

        if (!fromAccount) {
            return res.status(404).json({ message: 'Source account not found' });
        }

        if (!toAccount) {
            return res.status(404).json({ message: 'Destination account not found' });
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance in source account' });
        }

        // Perform transfer
        fromAccount.balance -= amount;
        toAccount.balance += amount;

        await fromAccount.save();
        await toAccount.save();

        res.json({
            message: 'Transfer successful',
            fromAccount: {
                _id: fromAccount._id,
                name: fromAccount.name,
                balance: fromAccount.balance
            },
            toAccount: {
                _id: toAccount._id,
                name: toAccount.name,
                balance: toAccount.balance
            },
            amount,
            description
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    transferBetweenAccounts
};
