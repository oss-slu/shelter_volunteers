import { fetchClient, patchRequest } from "./fetchClient";
import httpClient from "./httpClient";

/**
 * Fetches the current volunteer's profile data (Name, Email, Contact Number).
 * @returns {Promise<Object>} The volunteer profile data.
 */
export const getUserProfile = async () => {
  return httpClient
    .get("/volunteer/profile")
    .then((response) => response.data)
    .then((data) => ({
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      email: data.email ?? "",
      phone: data.phone_number?.toString() ?? "",
      skills: data.skills?.join(", ") ?? "",
    }))
    .catch(() => null);
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
  const data = {
    first_name: profileData.firstName,
    last_name: profileData.lastName,
    email: profileData.email,
    phone_number: profileData.phone,
    skills: profileData.skills.split(",").map((skill) => skill.trim()),
  };

  return httpClient
    .post("/volunteer/profile", data)
    .then((response) => response.data)
    .then((data) => ({
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      email: data.email ?? "",
      phone: data.phone_number?.toString() ?? "",
      skills: data.skills?.join(", ") ?? "",
    }))
    .catch((error) => Promise.reject(error.response.data.errors));
};
