import { fetchClient, patchRequest } from "./fetchClient";

/**
 * Fetches the current volunteer's profile data (Name, Email, Contact Number).
 * @returns {Promise<Object>} The volunteer profile data.
 */
export const getUserProfile = async () => {
  try {
    return await fetchClient("/volunteer/profile", {
      method: "GET",
    });
  } catch (error) {
    return null;
  }
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

export const postUserProfile = async (profileData) => {
  const response = await fetchClient("/volunteer/profile", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
  return response;
};
