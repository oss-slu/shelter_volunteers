// fetchClient.js
import { SERVER } from "../config";
import { getToken } from "../authentication/getToken";
import { getGlobalLogout } from "../contexts/AuthContext";

// Create a navigation function that will be set by the App component
let navigate = null;

// Function to set the navigate function from your App component
export const setNavigate = (navigateFunction) => {
  navigate = navigateFunction;
};

// Central fetch wrapper function
export const fetchClient = async (endpoint, options = {}) => {
  // Get the token from storage
  const token = getToken();
  
  // Prepare headers with authentication
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  if (token) {
    headers.Authorization = `${token}`;
  }
  
  // Prepare the complete request config
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${SERVER}${endpoint}`, config);
    
    // Check if the response indicates authentication failure
    if (response.status === 401) {
      // Use the global logout function to clear auth state and update React state
      const logout = getGlobalLogout();
      if (logout) {
        logout();
      }
      
      // Navigate to home
      if (navigate) {
        navigate('/home');
      }
      
      return Promise.reject(new Error('Authentication failed'));
    }
    
    // If the response is not OK and not a 401, handle other errors
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.message) {
        throw new Error(errorData.message);
      }
      const responseText = await response.text();
      throw new Error(responseText || 'An error occurred while processing your request');
    }
    
    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.log('Fetch error:');
    throw error;
  }
};