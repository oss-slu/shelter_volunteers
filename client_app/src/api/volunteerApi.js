import { getRequest, patchRequest } from "./fetchClient";

/**
 * Fetches the current volunteer's profile data (Name, Email, Contact Number).
 * @returns {Promise<Object>} The volunteer profile data.
 */
export const fetchUserProfile = async () => {
    // Assuming the backend uses the Authorization token to identify the user
    // and returns the profile data directly. Endpoint: GET /volunteer/profile
    return getRequest("/volunteer/profile");
};

/**
 * Updates the volunteer's profile data.
 * @param {Object} profileData - The data to update (name, email, contactNumber).
 * @returns {Promise<Object>} The response from the server (e.g., success message).
 */
export const updateUserProfile = async (profileData) => {
    // Uses patchRequest to send the updated fields. Endpoint: PATCH /volunteer/profile
    return patchRequest("/volunteer/profile", profileData);
};
