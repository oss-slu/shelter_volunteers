import { fetchClient } from "./fetchClient";

export const serviceShiftAPI = {
  getShiftsForShelter: async (shelterId) => {
    const response = await fetchClient(`/shelters/${shelterId}/service_shifts`);
    return response;
  },
  getFutureShifts: async () => {
    const timeNow = Date.now();
    const response = await fetchClient(`/service_shifts?filter_start_after=${timeNow}`);
    return response;
  },
  getFutureShiftsForShelter: async (shelterId) => {
    const timeNow = Date.now();
    const response = await fetchClient(
      `/shelters/${shelterId}/service_shifts?filter_start_after=${timeNow}`,
    );
    return response;
  },
  addShifts: async (shelterId, data) => {
    const response = await fetchClient(`/shelters/${shelterId}/service_shifts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },
  updateShift: async (shelterId, shiftId, data) => {
    const response = await fetchClient(`/shelters/${shelterId}/service_shifts/${shiftId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response;
  },
  getUserInfosInShift: async (shiftId) => {
    return await fetchClient(`/service_shifts/${shiftId}/user_info`, {
      method: "GET",
    });
  },
};
