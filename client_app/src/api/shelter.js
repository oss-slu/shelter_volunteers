import { fetchClient } from "./fetchClient";

export const shelterAPI = {
    getShelters: async () => {
        const response = await fetchClient("/shelters");
        return response;
    },
    getShelter: async (id) => {
        const response = await fetchClient(`/shelters/${id}`);
        return response;
    },
    addShelter: async (data) => {
        const response = await fetchClient("/shelters", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    }
};

