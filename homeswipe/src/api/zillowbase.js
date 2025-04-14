//src/api/zillowbase.js
import axios from 'axios';

export async function fetchListings(preferences) {
  // Build query parameters using the provided preferences.
  const queryParams = new URLSearchParams({
    city: preferences.city,
    state: preferences.state,
    minPrice: preferences.minPrice,
    bedrooms: preferences.bedrooms,
    bathrooms: preferences.bathrooms,
    maxPrice: preferences.maxPrice,
  });

  try {
    // Call backend endpoint 
    const response = await axios.get(`http://localhost:5001/api/zillow/homes?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch listings from backend:', error);
    return [];
  }
}