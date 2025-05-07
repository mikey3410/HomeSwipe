//src/api/zillowbase.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export async function fetchListings(preferences) {
  // Build query parameters using the provided preferences.
  const queryParams = new URLSearchParams({
    city: preferences.city,
    state: preferences.state,
    minPrice: preferences.minPrice || '',
    bedrooms: preferences.bedrooms || '',
    bathrooms: preferences.bathrooms || '',
    maxPrice: preferences.maxPrice || '',
    forceRefresh: preferences.forceRefresh ? 'true' : 'false'
  });

  console.log('Query Parameters:', queryParams.toString()); // Debugging log

  try {
    // Call backend endpoint 
    const response = await axios.get(`${API_BASE_URL}/zillow/homes?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch listings from backend:', error);
    return [];
  }
}

/**
 * Refresh listings for a specific city to get the latest data
 * @param {Object} options - Options for refreshing
 * @param {string} options.city - The city to refresh listings for
 * @param {string} options.state - The state (optional)
 * @param {number} options.limit - Maximum number of listings to refresh (default: 20)
 * @returns {Promise<Object>} - Refresh results
 */
export async function refreshListings({ city, state = '', limit = 20 }) {
  if (!city) {
    throw new Error('City is required to refresh listings');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/zillow/refresh/${city}`, {
      params: { state, limit }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to refresh listings:', error);
    throw error;
  }
}