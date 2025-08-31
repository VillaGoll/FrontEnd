import api from './api';

const getAllUsers = () => {
    return api.get('/users');
};

const getAllEmails = () => {
    return api.get('/users/emails');
};

const createUser = (data: any) => {
    return api.post('/users', data);
};

const updateUser = (id: string, data: any) => {
    return api.put(`/users/${id}`, data);
};

const deleteUser = (id: string) => {
    return api.delete(`/users/${id}`);
};

const userService = {
    getAllUsers,
    getAllEmails,
    createUser,
    updateUser,
    deleteUser,
};

export default userService;