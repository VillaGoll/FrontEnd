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
        // Manejo de errores de respuesta
        if (error.response) {
            // La solicitud se hizo y el servidor respondió con un código de estado
            // que cae fuera del rango de 2xx
            console.error("Error de respuesta:", error.response.data);
            return Promise.reject(error.response.data); 
        } else if (error.request) {
            // La solicitud se hizo pero no se recibió respuesta
            console.error("No se recibió respuesta:", error.request);
            return Promise.reject({ msg: "No se pudo conectar con el servidor. Inténtalo de nuevo." });
        } else {
            // Algo sucedió al configurar la solicitud que provocó un error
            console.error("Error de configuración de la solicitud:", error.message);
            return Promise.reject({ msg: "Error al configurar la solicitud." });
        }
    }
);
export default api;
