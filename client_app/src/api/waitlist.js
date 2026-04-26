import { fetchClient } from "./fetchClient";

export const waitlistAPI = {
  join: async (shiftId) => {
    return await fetchClient(`/service_shifts/${shiftId}/waitlist`, {
      method: "POST",
    });
  },
  leave: async (shiftId) => {
    return await fetchClient(`/service_shifts/${shiftId}/waitlist`, {
      method: "DELETE",
    });
  },
  getMine: async () => {
    return await fetchClient(`/waitlist`);
  },
  getForShift: async (shelterId, shiftId) => {
    return await fetchClient(
      `/shelters/${shelterId}/service_shifts/${shiftId}/waitlist`,
    );
  },
};
