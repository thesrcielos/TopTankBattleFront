import axiosInstance from "@/api/Api";
const api = axiosInstance();
const url = import.meta.env.VITE_BACKEND_URL + "/api/v1/rooms";
export const getRooms = async () => {
    try {
        const response = await api.get(url + "?page=0&size=20");
        return response.data;
    }
    catch (error) {
        console.error("Error fetching rooms:", error);
        throw error;
    }
};
export const createRoom = async (request) => {
    try {
        const response = await api.post(url, request);
        return response.data;
    }
    catch (error) {
        console.error("Error creating room:", error);
        throw error;
    }
};
export const leaveRoom = async (playerId) => {
    try {
        const response = await api.delete(`${url}/players?playerId=${playerId}`);
        return response.data;
    }
    catch (error) {
        console.error("Error leaving room:", error);
        throw error;
    }
};
export const joinRoom = async (userId, roomId) => {
    try {
        const response = await api.post(`${url}/players`, { "player": userId, "room": roomId });
        return response.data;
    }
    catch (error) {
        console.error("Error leaving room:", error);
        throw error;
    }
};
