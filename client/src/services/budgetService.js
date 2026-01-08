import api from './api';

export const budgetService = {
    // Get all budgets
    getAll: async (params = {}) => {
        const response = await api.get('/budgets', { params });
        return response.data;
    },

    // Get single budget
    getById: async (id) => {
        const response = await api.get(`/budgets/${id}`);
        return response.data;
    },

    // Create budget
    create: async (data) => {
        const response = await api.post('/budgets', data);
        return response.data;
    },

    // Update budget
    update: async (id, data) => {
        const response = await api.put(`/budgets/${id}`, data);
        return response.data;
    },

    // Delete budget
    delete: async (id) => {
        const response = await api.delete(`/budgets/${id}`);
        return response.data;
    }
};
