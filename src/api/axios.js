import axios from 'axios';
import { BASE_URL } from '../constants';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Intercept responses for token expiration
api.interceptors.response.use(
    (response) => response,
    async(error) => {
        // If unauthorized or forbidden due to expired token
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const authContext = JSON.parse(localStorage.getItem('auth'));
            if (authContext) {
                // Optionally, notify or log
                console.warn('Token expired. Logging out...');
                localStorage.removeItem('auth');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;