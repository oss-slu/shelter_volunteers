import { fetchClient } from "./fetchClient";

export const shelterAPI = {
    getShelters: async () => {
        const response = await fetchClient("/shelter");
        return response;
    },
    getShelter: async (id) => {
        const response = await fetchClient(`/shelter/${id}`);
        return response;
    },
    addShelter: async (data) => {
        const response = await fetchClient("/shelter", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    },
    // Add this function to the shelterAPI object in shelter.js
    getSchedule: async (shelterId) => {
    const response = await fetchClient(`/schedule?shelter_id=${shelterId}`);
    return response;
    }
}