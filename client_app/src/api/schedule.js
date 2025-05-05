import { fetchClient } from "./fetchClient";

export const scheduleAPI = {
  // Existing POST function for submitting repeatable shifts
  submitRepeatableShifts: async (shelterId, shifts) => {
    const response = await fetchClient("/schedule", {
      method: "POST",
      body: JSON.stringify({ shelter_id: shelterId, shifts }),
    });
    return response;
  },

  // New GET function to retrieve shifts
  getShifts: async (shelterId, params = {}) => {
    // Build query string from optional params
    const queryParams = new URLSearchParams();
    
    // Add shelterId as a required parameter
    queryParams.append("shelter_id", shelterId);
    
    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    const response = await fetchClient(`/schedule?${queryParams.toString()}`, {
      method: "GET"
    });
    
    return response;
  }
};
