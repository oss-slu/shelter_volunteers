import httpClient from "./httpClient";

const shiftSnakeToCamel = (shift) => ({
  shiftStart: shift.shift_start,
  shiftEnd: shift.shift_end,
  requiredVolunteerCount: shift.required_volunteer_count,
  maxVolunteerCount: shift.max_volunteer_count,
  shiftName: shift.shift_name,
  id: shift.id,
});

const shiftCamelToSnake = (shift) => ({
  shift_start: shift.shiftStart,
  shift_end: shift.shiftEnd,
  required_volunteer_count: shift.requiredVolunteerCount,
  max_volunteer_count: shift.maxVolunteerCount,
  shift_name: shift.shiftName,
  id: shift.id,
});

export const repeatableShiftsApi = {
  getRepeatableShifts: (shelterId) => {
    return httpClient
      .get(`/shelters/${shelterId}/schedule`)
      .then((response) => response.data)
      .then((data) => data.map(shiftSnakeToCamel))
      .catch((error) => console.log(error));
  },
  setRepeatableShifts: (shelterId, shifts) => {
    const body = shifts.map(shiftCamelToSnake);
    return httpClient
      .post(`/shelters/${shelterId}/schedule`, body)
      .then((response) => response.data)
      .then((data) => data.map(shiftSnakeToCamel))
      .catch((error) => console.log(error));
  },
};
