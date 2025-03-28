// fetchClient.js
import { SERVER } from "../config";
import { useNavigate } from "react-router-dom";

// Central fetch wrapper function
export const fetchClient = async (endpoint, options = {}) => {
  // Get the token from storage
  const token = localStorage.getItem('token');
  
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
      // Redirect to login page
      window.location.assign("/home")
      return Promise.reject(new Error('Authentication failed'));
    }
    
    // If the response is not OK and not a 401, handle other errors
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};