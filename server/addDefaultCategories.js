// Script to add default categories to existing users
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const User = require('./models/User');

dotenv.config();

// Default categories
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

const addDefaultCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        for (const user of users) {
            // Check if user already has categories
            const existingCategories = await Category.countDocuments({ user: user._id });

            if (existingCategories > 0) {
                console.log(`User ${user.email} already has ${existingCategories} categories, skipping...`);
                continue;
            }

            // Create expense categories
            const expenseCategories = defaultExpenseCategories.map(cat => ({
                ...cat,
                user: user._id,
                type: 'expense'
            }));

            // Create income categories
            const incomeCategories = defaultIncomeCategories.map(cat => ({
                ...cat,
                user: user._id,
                type: 'income'
            }));

            // Insert all categories
            await Category.insertMany([...expenseCategories, ...incomeCategories]);
            console.log(`✓ Created ${expenseCategories.length + incomeCategories.length} categories for ${user.email}`);
        }

        console.log('\n✅ Done! Default categories added to all users.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

addDefaultCategories();
