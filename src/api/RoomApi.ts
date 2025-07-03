import axiosInstance from "@/api/Api";
import { RoomCreate } from "@/types/types";

const api = axiosInstance()
const url: string = import.meta.env.VITE_BACKEND_URL + "/api/v1/rooms";

export const getRooms = async () => {
    try {
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw error;
    }
}

export const createRoom = async (request: RoomCreate) => {
    try {
        const response = await api.post(url, request);
        return response.data;
    } catch (error) {
        console.error("Error creating room:", error);
        throw error;
    }
}
