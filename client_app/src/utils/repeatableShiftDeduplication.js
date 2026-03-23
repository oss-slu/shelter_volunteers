const normalizeShiftValue = (shift, camelKey, snakeKey) => shift[camelKey] ?? shift[snakeKey];

const getRepeatableShiftDedupeKey = (shift) =>
  [
    normalizeShiftValue(shift, "shiftStart", "shift_start"),
    normalizeShiftValue(shift, "shiftEnd", "shift_end"),
    normalizeShiftValue(shift, "requiredVolunteerCount", "required_volunteer_count"),
    normalizeShiftValue(shift, "maxVolunteerCount", "max_volunteer_count"),
    normalizeShiftValue(shift, "shiftName", "shift_name") || "",
    (shift.instructions || "").trim(),
    Boolean(normalizeShiftValue(shift, "instructionsRecurring", "instructions_recurring")),
  ].join("|");

export const dedupeRepeatableShifts = (shifts) => {
  const deduped = [];
  const idxByKey = new Map();

  shifts.forEach((shift) => {
    const key = getRepeatableShiftDedupeKey(shift);
    const existingIdx = idxByKey.get(key);

    if (existingIdx === undefined) {
      idxByKey.set(key, deduped.length);
      deduped.push(shift);
      return;
    }

    if (!deduped[existingIdx].id && shift.id) {
      deduped[existingIdx] = shift;
    }
  });

  return deduped;
};
