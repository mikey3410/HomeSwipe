//src/api/zillowbase.js
import axios from 'axios';

export async function fetchListings(preferences) {
  // Build query parameters using the provided preferences.
  const queryParams = new URLSearchParams();

  queryParams.append('city', preferences.city);
  queryParams.append('state', preferences.state);
  queryParams.append('bedrooms', preferences.bedrooms);
  queryParams.append('bathrooms', preferences.bathrooms);

  if (preferences.minPrice) {
    queryParams.append('minPrice', preferences.minPrice);
  }
  if (preferences.maxPrice) {
    queryParams.append('maxPrice', preferences.maxPrice);
  }

  try {
    // Call backend endpoint
    const response = await axios.get(`http://localhost:5001/api/zillow/homes?${queryParams.toString()}`);
    console.log('Fetched listings:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch listings from backend:', error);
    return [];
  }
}