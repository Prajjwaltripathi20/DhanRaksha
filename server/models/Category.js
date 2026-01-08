const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        trim: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Please specify category type']
    },
    icon: {
        type: String,
        default: 'folder'
    },
    color: {
        type: String,
        default: '#6B7280'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
categorySchema.index({ user: 1, type: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
