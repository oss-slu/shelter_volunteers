import {
  distanceMiles,
  isOpenShift,
  openShiftsByShelter,
  buildShelterPoints,
  formatDistance,
} from "./nearbyShelters";

const shelter = (id, name, lat, lng) => ({
  _id: id,
  name,
  address: { street1: "1 Main St", city: "St. Louis", state: "MO", postal_code: "63101", coordinates: { latitude: lat, longitude: lng } },
});
const shift = (id, shelterId, start, extra = {}) => ({
  _id: id,
  shelter_id: shelterId,
  shift_start: start,
  shift_end: start + 4 * 3600000,
  volunteer_count: 1,
  max_volunteer_count: 5,
  can_sign_up: true,
  ...extra,
});

describe("distanceMiles", () => {
  it("is zero for the same point", () => {
    expect(distanceMiles([38.63, -90.2], [38.63, -90.2])).toBe(0);
  });

  it("matches a known distance (Gateway Arch to Kirkwood ~ 12 mi)", () => {
    const d = distanceMiles([38.6247, -90.1848], [38.583, -90.4065]);
    expect(d).toBeGreaterThan(11);
    expect(d).toBeLessThan(13);
  });
});

describe("isOpenShift", () => {
  it("is open when sign-up is allowed and spots remain", () => {
    expect(isOpenShift(shift("a", "s", 0))).toBe(true);
  });

  it("is closed when full or sign-up is closed", () => {
    expect(isOpenShift(shift("a", "s", 0, { volunteer_count: 5 }))).toBe(false);
    expect(isOpenShift(shift("a", "s", 0, { can_sign_up: false }))).toBe(false);
  });
});

describe("openShiftsByShelter", () => {
  it("counts open shifts and keeps the soonest start per shelter", () => {
    const result = openShiftsByShelter([
      shift("a", "s1", 300),
      shift("b", "s1", 100),
      shift("c", "s1", 50, { volunteer_count: 5 }), // full: ignored
      shift("d", "s2", 200),
    ]);
    expect(result).toEqual({ s1: { count: 2, nextStart: 100 }, s2: { count: 1, nextStart: 200 } });
  });
});

describe("buildShelterPoints", () => {
  const shelters = [
    shelter("far", "Far Shelter", 38.80, -90.32), // Florissant
    shelter("near", "Near Shelter", 38.63, -90.19), // Downtown
    shelter("none", "No Shifts Shelter", 38.62, -90.20),
    { _id: "nocoords", name: "No Coords", address: { street1: "x", city: "y", state: "MO", coordinates: {} } },
  ];
  const shifts = [shift("1", "far", 100), shift("2", "near", 500)];

  it("puts shelters with open shifts first and skips ones without coordinates", () => {
    const points = buildShelterPoints(shelters, shifts);
    expect(points.map((p) => p.id)).toEqual(["far", "near", "none"]);
    expect(points[2].openCount).toBe(0);
  });

  it("orders by distance once the volunteer's position is known", () => {
    const downtown = [38.627, -90.1994];
    const points = buildShelterPoints(shelters, shifts, downtown);
    expect(points.map((p) => p.id)).toEqual(["near", "far", "none"]);
    expect(points[0].distance).toBeLessThan(1);
    expect(points[1].distance).toBeGreaterThan(10);
  });
});

describe("formatDistance", () => {
  it("uses one decimal under 10 miles", () => {
    expect(formatDistance(2.345)).toBe("2.3 mi");
    expect(formatDistance(12.6)).toBe("13 mi");
    expect(formatDistance(null)).toBe("");
  });
});
