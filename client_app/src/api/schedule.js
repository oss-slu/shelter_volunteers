import { fetchClient } from "./fetchClient";

export const scheduleAPI = {
  // POST for submitting repeatable shifts
  submitRepeatableShifts: async (shelterId, shifts) => {
    const response = await fetchClient("/schedule", {
      method: "POST",
      body: JSON.stringify({
        shelter_id: shelterId,
        shifts: shifts,
      }),
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
