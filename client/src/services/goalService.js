import api from './api';

export const goalService = {
    getAll: async (status = '') => {
        const response = await api.get('/goals', { params: { status } });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/goals/${id}`);
        return response.data;
    },

    create: async (goalData) => {
        const response = await api.post('/goals', goalData);
        return response.data;
    },

    update: async (id, goalData) => {
        const response = await api.put(`/goals/${id}`, goalData);
        return response.data;
    },

    contribute: async (id, amount) => {
        const response = await api.post(`/goals/${id}/contribute`, { amount });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/goals/${id}`);
        return response.data;
    },
};
