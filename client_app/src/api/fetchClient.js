// fetchClient.js
import { SERVER } from "../config";
import { getGlobalLogout } from "../contexts/AuthContext";

// Create a navigation function that will be set by the App component
let navigate = null;

// Function to set the navigate function from your App component
export const setNavigate = (navigateFunction) => {
  navigate = navigateFunction;
};

// Central fetch wrapper function
export const fetchClient = async (endpoint, options = {}) => {
  // Prepare headers with authentication
  const headers = {
    "Content-Type": "application/json",
    "X-Volunteer-Session": "1",
  };

  // Prepare the complete request config
  const config = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(`${SERVER}${endpoint}`, config);

    // Check if the response indicates authentication failure
    if ((response.status === 401 || response.status === 403) &&
        !endpoint.startsWith("/login") && endpoint !== "/session") {
      const logout = getGlobalLogout();
      if (logout) {
        logout().catch((error) => console.error("Sign-out failed:", error));
      }
      if (navigate) {
        navigate("/");
      }
      return Promise.reject(new Error("Authentication failed"));
    }

    // Read error bodies once: JSON parsing consumes the response stream.
    if (!response.ok) {
      const responseText = await response.text();
      let errorMessage = `Request failed (HTTP ${response.status})`;
      try {
        const errorData = JSON.parse(responseText);
        if (typeof errorData?.message === "string" && errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData?.error === "string" && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        if (responseText.trim() && !responseText.trim().startsWith("<")) {
          errorMessage = responseText;
        }
      }
      throw new Error(errorMessage);
    }

    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.log("Fetch error:", error.message);
    throw error;
  }
};

// ✅ Helper functions for common request types
export const getRequest = (endpoint) => fetchClient(endpoint, { method: "GET" });

export const postRequest = (endpoint, data) =>
  fetchClient(endpoint, { method: "POST", body: JSON.stringify(data) });

export const putRequest = (endpoint, data) =>
  fetchClient(endpoint, { method: "PUT", body: JSON.stringify(data) });

// Patch request MUST be exported to be used by the new feature
export const patchRequest = (
  endpoint,
  data, // <-- EXPORT ADDED HERE
) => fetchClient(endpoint, { method: "PATCH", body: JSON.stringify(data) });

export const deleteRequest = (endpoint) => fetchClient(endpoint, { method: "DELETE" });
