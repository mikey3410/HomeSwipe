//zillowbase.js
import axios from 'axios';

const API_KEY = 'abb7cde94amsh5085c0eca0f92b6p19c0d8jsn2e1a4f0a457a'; // actual key

export async function fetchListings(preferences) {
  const options = {
    method: 'GET',
    url: 'https://zillow-base1.p.rapidapi.com/WebAPIs/zillow/search',

    params: Object.fromEntries(
      Object.entries({
        location: `${preferences.city}, ${preferences.state}`,
        page: '1',
        status_type: 'ForSale',
        sort_by: 'Homes_For_You',
        min_price: preferences.minPrice,
        max_price: preferences.maxPrice,
        min_beds: preferences.bedrooms,
        min_baths: preferences.bathrooms,
      }).filter(([_, value]) => value !== '' && value !== undefined)
    ),
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': 'zillow-base1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data?.searchResultsData || [];
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    return [];
  }
}