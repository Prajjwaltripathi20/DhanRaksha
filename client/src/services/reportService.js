import api from './api';

export const reportService = {
    // Get dashboard data
    getDashboard: async () => {
        const response = await api.get('/reports/dashboard');
        return response.data;
    },

    // Get spending by category
    getSpendingByCategory: async (params = {}) => {
        const response = await api.get('/reports/spending-by-category', { params });
        return response.data;
    },

    // Get monthly trend
    getMonthlyTrend: async (params = {}) => {
        const response = await api.get('/reports/monthly-trend', { params });
        return response.data;
    },

    // Get account balances
    getAccountBalances: async () => {
        const response = await api.get('/reports/account-balances');
        return response.data;
    },

    // Get budget performance
    getBudgetPerformance: async () => {
        const response = await api.get('/reports/budget-performance');
        return response.data;
    }
};
