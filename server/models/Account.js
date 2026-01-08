const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide an account name'],
        trim: true
    },
    type: {
        type: String,
        enum: ['cash', 'bank', 'credit_card', 'investment', 'loan', 'other'],
        required: [true, 'Please specify account type']
    },
    balance: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    color: {
        type: String,
        default: '#3B82F6'
    },
    icon: {
        type: String,
        default: 'wallet'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    }
}, {
    timestamps: true
});

// Index for faster queries
accountSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Account', accountSchema);
