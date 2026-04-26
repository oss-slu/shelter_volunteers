import { fetchClient } from "./fetchClient";

export const shelterAPI = {
    getShelters: async () => {
        const response = await fetchClient("/shelters");
        return response;
    },
    getOpenShelters: async () => {
        const response = await fetchClient("/shelters/open");
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
    },
    getOpenSheltersByDate: async ({ tzOffsetMinutes } = {}) => {
        const params = new URLSearchParams();
        if (typeof tzOffsetMinutes === "number" && Number.isFinite(tzOffsetMinutes)) {
            params.set("tz_offset_minutes", String(tzOffsetMinutes));
        }
        const query = params.toString();
        const path = `/admin/open_shelters_by_date${query ? `?${query}` : ""}`;
        const response = await fetchClient(path);
        return response;
    },
};
