import axios from 'axios';
import { checkTokenExpiration } from '../utils/auth';

const api = axios.create({
    baseURL: 'https://backenvillagolbackend.fly.dev/api', // URL pública de tu backend en Fly.io
    //baseURL: 'http://localhost:5000/api', // URL pública de tu backend en Fly.io
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (checkTokenExpiration()) {
        // Cancel request if token is expired
        return Promise.reject(new Error('Token expired'));
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            checkTokenExpiration(); // Handle token expiration on 401
        }
        return Promise.reject(error);
    }
);
export default api;
