import api from './api';

const getAllUsers = () => {
    return api.get('/users');
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
    createUser,
    updateUser,
    deleteUser,
};

export default userService;