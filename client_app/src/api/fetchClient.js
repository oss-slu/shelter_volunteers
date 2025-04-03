// fetchClient.js
import { SERVER } from "../config";
import getToken from "../authentication/getToken";
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
      // Clear authentication data
      localStorage.removeItem('token');
      // TODO: somehow redirect the application back to login 
      return Promise.reject(new Error('Authentication failed'));
    }
    
    // If the response is not OK and not a 401, handle other errors
    if (!response.ok) {
      const error = `HTTP error! Status: ${response.status}`;
      console.error(error);
      throw new Error(error);
    }
    
    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.log('Fetch error:');
    throw error;
  }
};
