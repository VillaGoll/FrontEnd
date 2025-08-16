import api from './api';

const register = (userData: any) => {
    return api.post('/auth/register', userData).then(response => {
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    });
};

const login = (userData: any) => {
    return api.post('/auth/login', userData).then(response => {
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    });
};

const reAuth = (password: string) => {
    return api.post('/auth/re-auth', { password });
};

const authService = {
    register,
    login,
    reAuth,
};

export default authService;