import { fetchClient } from "./fetchClient";

export const scheduleAPI = {
  // POST for submitting repeatable shifts (as a raw array, not wrapped in an object)
  submitRepeatableShifts: async (_shelterId, shifts) => {
    const response = await fetchClient("/schedule", {
      method: "POST",
      body: JSON.stringify(shifts), // backend expects a raw list
    });
    return response;
  },

  // GET to retrieve shifts
  getShifts: async (shelterId, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append("shelter_id", shelterId);
    Object.entries(params).forEach(([key, value]) =>
      queryParams.append(key, value)
    );
    const response = await fetchClient(`/schedule?${queryParams.toString()}`);
    return response;
  }
};
