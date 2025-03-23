import { fetchClient } from "./fetchClient";

export const serviceShiftAPI = {
    getShiftsForShelter: async(shelterId) => {
        const response = await fetchClient(`/service_shift?shelter_id=${shelterId}`);
        return response;
    },
    getFutureShifts: async() => {
        const timeNow = new Date().getMilliseconds();
        const response = await fetchClient(`/service_shift?filter_start_after=${timeNow}`);
        return response;
    },
    addShifts: async(data) => {
        const response = await fetchClient("/service_shift", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    }
}