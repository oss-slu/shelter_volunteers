// schedule.js
import { fetchClient } from "./fetchClient";

export const scheduleAPI = {
  submitRepeatableShifts: async (shelterId, shifts) => {
    const response = await fetchClient("/schedule", {
      method: "POST",
      body: JSON.stringify({ shelter_id: shelterId, shifts }),
    });
    return response;
  }
};
