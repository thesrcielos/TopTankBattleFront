import axios from 'axios';
const url = import.meta.env.VITE_BACKEND_URL + "/api/v1/users";
export const loginUser = async ({ username, password }) => {
    try {
        const response = await axios.post(`${url}/login`, {
            username: username,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
export const signup = async ({ username, password }) => {
    try {
        const response = await axios.post(`${url}/signup`, {
            username: username,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
