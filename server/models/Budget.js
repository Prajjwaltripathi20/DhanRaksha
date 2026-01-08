const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please specify a category']
    },
    amount: {
        type: Number,
        required: [true, 'Please provide a budget amount'],
        min: [0, 'Budget amount cannot be negative']
    },
    spent: {
        type: Number,
        default: 0,
        min: [0, 'Spent amount cannot be negative']
    },
    period: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    alertThreshold: {
        type: Number,
        min: [0, 'Alert threshold must be between 0 and 100'],
        max: [100, 'Alert threshold must be between 0 and 100'],
        default: 80
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for remaining budget
budgetSchema.virtual('remaining').get(function () {
    return this.amount - this.spent;
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function () {
    return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
});

// Index for faster queries
budgetSchema.index({ user: 1, isActive: 1 });
budgetSchema.index({ user: 1, startDate: 1, endDate: 1 });

// Ensure virtuals are included in JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
