import { fetchClient } from "./fetchClient";

export const scheduleAPI = {
  // POST for submitting repeatable shifts (as a raw array, not wrapped in an object)
  submitRepeatableShifts: async (_shelterId, shifts) => {
    const response = await fetchClient(`/shelters/${_shelterId}/schedule`, {
      method: "POST",
      body: JSON.stringify(shifts), // backend expects a raw list
    });
    return response;
  },

  // GET to retrieve shifts
  getShifts: async (shelterId) => {
    const response = await fetchClient(`/shelters/${shelterId}/schedule`);
    return response;
  }
};
