import axios from "axios";

const API_URL = "http://localhost:5000";

/**
 * Sends a POST request to create a new shift.
 * @param {Object} shiftData - The shift details, including repeat days.
 */
export const createShift = async (shiftData) => {
    try {
        const response = await axios.post(`${API_URL}/shifts`, shiftData);
        return response.data;
    } catch (error) {
        console.error("Error creating shift", error);
        throw error;
    }
};