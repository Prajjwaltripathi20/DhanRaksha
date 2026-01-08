import api from './api';

export const accountService = {
    // Get all accounts
    getAll: async (params = {}) => {
        const response = await api.get('/accounts', { params });
        return response.data;
    },

    // Get single account
    getById: async (id) => {
        const response = await api.get(`/accounts/${id}`);
        return response.data;
    },

    // Create account
    create: async (data) => {
        const response = await api.post('/accounts', data);
        return response.data;
    },

    // Update account
    update: async (id, data) => {
        const response = await api.put(`/accounts/${id}`, data);
        return response.data;
    },

    // Delete account
    delete: async (id) => {
        const response = await api.delete(`/accounts/${id}`);
        return response.data;
    },

    // Transfer between accounts
    transfer: async (fromAccountId, toAccountId, amount, description = '') => {
        const response = await api.post('/accounts/transfer', {
            fromAccountId,
            toAccountId,
            amount,
            description
        });
        return response.data;
    }
};
