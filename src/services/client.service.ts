import api from './api';

const createClient = async (clientData: any) => {
    try {
        const response = await api.post('/clients', clientData);
        return response;
    } catch (error: any) {
        throw error.response?.data?.message || 'Error creating client';
    }
};

const getAllClients = () => {
    return api.get('/clients');
};

const getClientStats = (id: string) => {
    return api.get(`/clients/${id}/stats`);
};

const getClientBookings = (id: string) => {
    return api.get(`/clients/${id}/bookings`);
};

const updateClient = async (id: string, clientData: any) => {
    try {
        const response = await api.put(`/clients/${id}`, clientData);
        return response;
    } catch (error: any) {
        throw error.response?.data?.message || 'Error updating client';
    }
};

const deleteClient = (id: string) => {
    return api.delete(`/clients/${id}`);
};

export default {
    createClient,
    getAllClients,
    getClientStats,
    getClientBookings,
    updateClient,
    deleteClient,
};