import { toMapPoints } from "./mapPoints";

const EARTH_RADIUS_MILES = 3958.8;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Great-circle distance in miles between two [lat, lng] pairs. */
export function distanceMiles([lat1, lng1], [lat2, lng2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

/**
 * A shift a volunteer could still take: sign-up is open and it isn't full.
 * (Upcoming-ness comes from the API call, which only returns future shifts.)
 */
export function isOpenShift(shift) {
  if (shift.can_sign_up === false) return false;
  if (typeof shift.max_volunteer_count === "number" && typeof shift.volunteer_count === "number") {
    return shift.volunteer_count < shift.max_volunteer_count;
  }
  return true;
}

/** { [shelterId]: { count, nextStart } } for open shifts. */
export function openShiftsByShelter(shifts = []) {
  const byShelter = {};
  for (const shift of shifts) {
    if (!isOpenShift(shift)) continue;
    const entry = byShelter[shift.shelter_id] || { count: 0, nextStart: Infinity };
    entry.count += 1;
    entry.nextStart = Math.min(entry.nextStart, shift.shift_start);
    byShelter[shift.shelter_id] = entry;
  }
  return byShelter;
}

/**
 * Map points for every shelter with coordinates, annotated with its open
 * shifts and (when the volunteer's position is known) distance in miles.
 * Sorted: shelters with open shifts first, then nearest (or soonest shift
 * when there is no position), then by name.
 */
export function buildShelterPoints(shelters, shifts, userPosition = null) {
  const open = openShiftsByShelter(shifts);
  const points = toMapPoints(shelters).map((point) => {
    const info = open[point.id] || { count: 0, nextStart: null };
    return {
      ...point,
      openCount: info.count,
      nextStart: info.count ? info.nextStart : null,
      distance: userPosition ? distanceMiles(userPosition, point.position) : null,
    };
  });
  return points.sort((a, b) => {
    if (!!b.openCount !== !!a.openCount) return b.openCount ? 1 : -1;
    if (userPosition) return a.distance - b.distance;
    if (a.nextStart !== b.nextStart) return (a.nextStart ?? Infinity) - (b.nextStart ?? Infinity);
    return a.name.localeCompare(b.name);
  });
}

export function formatDistance(miles) {
  if (miles == null) return "";
  return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
}
