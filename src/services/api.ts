import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // temporalmente 5001 mientras 5000 está ocupado
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export default api;