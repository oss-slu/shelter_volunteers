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
    }
};

export const scheduleAPI = {
    getSchedule: async (shelterId) => {
        // Try to fetch from the API first
        try {
            const response = await fetchClient(`/schedule?shelter_id=${shelterId}`);
            return response;
        } catch (error) {
            console.log("Using mock schedule data since API endpoint is not available yet");
            // Return mock data in the format the API will eventually return
            return [
                {
                    shift_name: "Morning Shift",
                    start_time_offset: 8 * 3600000,   // 8:00 AM
                    end_time_offset: 12 * 3600000,    // 12:00 PM
                    required_volunteer_count: 5,
                },
                {
                    shift_name: "Afternoon Shift",
                    start_time_offset: 13 * 3600000,  // 1:00 PM
                    end_time_offset: 17 * 3600000,    // 5:00 PM
                    required_volunteer_count: 4,
                },
                {
                    shift_name: "Evening Shift",
                    start_time_offset: 18 * 3600000,  // 6:00 PM
                    end_time_offset: 22 * 3600000,    // 10:00 PM
                    required_volunteer_count: 3,
                },
            ];
        }
    }
};
