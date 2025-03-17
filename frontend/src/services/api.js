import axios from 'axios';

// Use environment variable for API URL or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'https://abdelkader01.pythonanywhere.com/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Trip-related API calls
export const tripService = {
  // Create a new trip
  createTrip: async (tripData) => {
    try {
      const response = await api.post('/trips/', tripData);
      return response.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  },

  // Get all trips
  getTrips: async () => {
    try {
      const response = await api.get('/trips/');
      return response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  // Get trip by ID
  getTrip: async (id) => {
    try {
      const response = await api.get(`/trips/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching trip ${id}:`, error);
      throw error;
    }
  },

  // Get route for a trip
  getRoute: async (id) => {
    try {
      const response = await api.get(`/trips/${id}/route/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching route for trip ${id}:`, error);
      throw error;
    }
  },

  // Get ELD logs for a trip
  getLogs: async (id) => {
    try {
      const response = await api.get(`/trips/${id}/logs/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for trip ${id}:`, error);
      throw error;
    }
  },
};

export default api;