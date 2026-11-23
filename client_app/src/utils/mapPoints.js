/** Pure helpers for placing shelters on a map (no Leaflet imports). */

// Downtown St. Louis — used until shelters load, or when none have coordinates.
export const STL_CENTER = [38.627, -90.1994];

/**
 * Keep only shelters with usable coordinates and flatten them into map points.
 */
export function toMapPoints(shelters) {
  if (!Array.isArray(shelters)) return [];
  return shelters
    .map((shelter) => {
      const coords = shelter?.address?.coordinates || {};
      const lat = Number(coords.latitude);
      const lng = Number(coords.longitude);
      if (
        coords.latitude == null ||
        coords.longitude == null ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180
      ) {
        return null;
      }
      const { street1, city, state, postal_code: postalCode } = shelter.address;
      return {
        id: shelter._id || `${shelter.name}-${lat}-${lng}`,
        name: shelter.name,
        street: street1 || "",
        locality: [city, [state, postalCode].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", "),
        position: [lat, lng],
      };
    })
    .filter(Boolean);
}
