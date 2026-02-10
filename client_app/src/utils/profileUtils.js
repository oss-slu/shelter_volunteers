/**
 * Checks if a volunteer profile is incomplete (missing required fields).
 * @param {object|null} profile - The volunteer profile object, or null if none exists
 * @returns {boolean} true if profile is missing or incomplete
 */
export function isProfileIncomplete(profile) {
  return (
    !profile ||
    !profile.firstName?.trim() ||
    !profile.lastName?.trim() ||
    !profile.phone?.trim()
  );
}
