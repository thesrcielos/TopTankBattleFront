import axios from 'axios';
import { removeToken } from "../context/AuthContext";
import Cookies from 'js-cookie';
const axiosInstance = () => {
    const instance = axios.create({
        baseURL: import.meta.env.VITE_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    instance.interceptors.request.use((config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => Promise.reject(error));
    instance.interceptors.response.use((response) => {
        return response;
    }, (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                console.log('Unauthorized. Logging out...');
                removeToken();
            }
        }
        return Promise.reject(error);
    });
    return instance;
};
export default axiosInstance;
