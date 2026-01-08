import api from './api';

export const transactionService = {
    // Get all transactions
    getAll: async (params = {}) => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    // Get single transaction
    getById: async (id) => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    // Create transaction
    create: async (data) => {
        const response = await api.post('/transactions', data);
        return response.data;
    },

    // Update transaction
    update: async (id, data) => {
        const response = await api.put(`/transactions/${id}`, data);
        return response.data;
    },

    // Delete transaction
    delete: async (id) => {
        const response = await api.delete(`/transactions/${id}`);
        return response.data;
    },

    // Get transaction statistics
    getStats: async (params = {}) => {
        const response = await api.get('/transactions/stats', { params });
        return response.data;
    }
};
