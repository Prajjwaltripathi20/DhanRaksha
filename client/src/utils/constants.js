// Account types
export const ACCOUNT_TYPES = [
    { value: 'cash', label: 'Cash', icon: 'wallet' },
    { value: 'bank', label: 'Bank Account', icon: 'building-2' },
    { value: 'credit_card', label: 'Credit Card', icon: 'credit-card' },
    { value: 'investment', label: 'Investment', icon: 'trending-up' },
    { value: 'loan', label: 'Loan', icon: 'arrow-down-circle' },
    { value: 'other', label: 'Other', icon: 'more-horizontal' },
];

// Transaction types
export const TRANSACTION_TYPES = [
    { value: 'income', label: 'Income', color: '#10B981' },
    { value: 'expense', label: 'Expense', color: '#EF4444' },
];

// Budget periods
export const BUDGET_PERIODS = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

// Category icons (Lucide icon names)
export const CATEGORY_ICONS = [
    'shopping-cart',
    'utensils',
    'home',
    'car',
    'plane',
    'heart',
    'briefcase',
    'gift',
    'film',
    'book',
    'smartphone',
    'zap',
    'droplet',
    'wifi',
    'coffee',
    'pizza',
    'shirt',
    'dumbbell',
    'graduation-cap',
    'stethoscope',
];

// Predefined colors
export const COLORS = [
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#06B6D4', // Cyan
];

// Default categories
export const DEFAULT_EXPENSE_CATEGORIES = [
    { name: 'Food & Dining', icon: 'utensils', color: '#EF4444' },
    { name: 'Transportation', icon: 'car', color: '#3B82F6' },
    { name: 'Shopping', icon: 'shopping-cart', color: '#8B5CF6' },
    { name: 'Entertainment', icon: 'film', color: '#EC4899' },
    { name: 'Bills & Utilities', icon: 'zap', color: '#F59E0B' },
    { name: 'Healthcare', icon: 'heart', color: '#EF4444' },
    { name: 'Education', icon: 'graduation-cap', color: '#10B981' },
    { name: 'Other', icon: 'more-horizontal', color: '#6B7280' },
];

export const DEFAULT_INCOME_CATEGORIES = [
    { name: 'Salary', icon: 'briefcase', color: '#10B981' },
    { name: 'Freelance', icon: 'laptop', color: '#3B82F6' },
    { name: 'Investment', icon: 'trending-up', color: '#8B5CF6' },
    { name: 'Gift', icon: 'gift', color: '#EC4899' },
    { name: 'Other', icon: 'more-horizontal', color: '#6B7280' },
];
