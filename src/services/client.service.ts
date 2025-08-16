import api from './api';

const createClient = (clientData: any) => {
    return api.post('/clients', clientData);
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

const updateClient = (id: string, clientData: any) => {
    return api.put(`/clients/${id}`, clientData);
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