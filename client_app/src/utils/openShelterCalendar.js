const isValidTimestamp = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const getDayBounds = (dateValue) => {
  const date = new Date(dateValue);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.getTime(),
    end: end.getTime(),
  };
};

const toDateKey = (dateValue) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOpenShelterIdsForDate = (shifts, dateValue) => {
  if (!Array.isArray(shifts) || !dateValue) {
    return new Set();
  }

  const { start, end } = getDayBounds(dateValue);

  return shifts.reduce((openShelterIds, shift) => {
    if (!shift?.shelter_id || !isValidTimestamp(shift.shift_start)) {
      return openShelterIds;
    }

    const shiftStart = new Date(shift.shift_start).getTime();
    if (shiftStart >= start && shiftStart <= end) {
      openShelterIds.add(shift.shelter_id);
    }

    return openShelterIds;
  }, new Set());
};

export const getOpenSheltersForDate = (shelters, shifts, dateValue) => {
  if (!Array.isArray(shelters) || shelters.length === 0) {
    return [];
  }

  const openShelterIds = getOpenShelterIdsForDate(shifts, dateValue);

  return shelters.filter((shelter) => openShelterIds.has(shelter._id));
};

export const getOpenSheltersGroupedByDate = (shelters, shifts) => {
  if (!Array.isArray(shelters) || !Array.isArray(shifts)) {
    return [];
  }

  const shelterMap = shelters.reduce((accumulator, shelter) => {
    accumulator[shelter._id] = shelter;
    return accumulator;
  }, {});

  const grouped = shifts.reduce((accumulator, shift) => {
    if (!shift?.shelter_id || !isValidTimestamp(shift.shift_start)) {
      return accumulator;
    }

    const shelter = shelterMap[shift.shelter_id];
    if (!shelter) {
      return accumulator;
    }

    const dateKey = toDateKey(shift.shift_start);
    if (!accumulator[dateKey]) {
      accumulator[dateKey] = {
        date: new Date(shift.shift_start),
        sheltersById: {},
      };
    }

    accumulator[dateKey].sheltersById[shelter._id] = shelter;
    return accumulator;
  }, {});

  return Object.values(grouped)
    .sort((left, right) => right.date.getTime() - left.date.getTime())
    .map((entry) => ({
      date: entry.date,
      shelters: Object.values(entry.sheltersById).sort((left, right) =>
        (left.name || '').localeCompare(right.name || '')
      ),
    }));
};
