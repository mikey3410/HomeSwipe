import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BasicImageCarousel from './BasicImageCarousel';

// Base URL for API calls
const API_URL = 'http://localhost:5001/api';

// Helper for price formatting
const formatPrice = (price) => {
  if (typeof price === 'number') {
    return price.toLocaleString();
  }
  
  if (typeof price === 'string') {
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericPrice)) {
      return numericPrice.toLocaleString();
    }
  }
  
  return 'Price not available';
};

// Handler function for image load errors in the carousel
const handleImageLoadError = ({ url, error, index }) => {
  console.error(`Image load error at index ${index}:`, { url, errorMessage: error?.message || 'Unknown error' });
};

// Get user's location (if browser supports it)
const getUserLocation = async () => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Convert coordinates to city name using a reverse geocoding API
            const response = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
            );
            
            if (response.data && response.data.city) {
              resolve(response.data.city);
            } else {
              resolve('');  // Default to empty if geocoding fails
            }
          } catch (error) {
            console.error("Error getting city from coordinates:", error);
            resolve('');
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          resolve('');
        }
      );
    } else {
      resolve('');  // Browser doesn't support geolocation
    }
  });
};

const DirectHomeList = ({ userId, initialCity = '' }) => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [inputCity, setInputCity] = useState(initialCity);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [locationLoaded, setLocationLoaded] = useState(false);
  
  // Try to get user's location on first load
  useEffect(() => {
    async function loadLocation() {
      if (!initialCity) {
        try {
          const userCity = await getUserLocation();
          if (userCity) {
            setSelectedCity(userCity);
            setInputCity(userCity);
            setMessage(`Using your location: ${userCity}`);
          } else {
            setMessage('Enter a city name to start searching');
          }
        } catch (error) {
          console.error("Failed to get user location:", error);
          setMessage('Enter a city name to start searching');
        }
      }
      setLocationLoaded(true);
    }
    
    loadLocation();
  }, [initialCity]);
  
  // Load homes when selectedCity changes (after location is loaded)
  useEffect(() => {
    if (selectedCity && locationLoaded) {
      fetchHomes();
    }
  }, [selectedCity, locationLoaded]);
  
  // Function to fetch homes from the API
  const fetchHomes = async (forceRefresh = false) => {
    if (!selectedCity) {
      setMessage('Please enter a city name to search');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage('');
    
    try {
      console.log(`Fetching homes for ${selectedCity}${forceRefresh ? ' (with refresh)' : ''}`);
      
      // Use the zillow API to get home listings
      const response = await axios.get(`${API_URL}/zillow/homes`, {
        params: {
          city: selectedCity,
          forceRefresh: forceRefresh ? 'true' : 'false'
        }
      });
      
      console.log(`Received ${response.data.length} homes`);
      
      if (response.data.length === 0) {
        setMessage(`No homes found for ${selectedCity}. Try another city or refresh.`);
      } else {
        // Transform homes with the simple approach that we know works
        const transformedHomes = response.data.map(home => {
          // Extract images from carouselPhotos exactly as in Swipe feature
          const images = Array.isArray(home.carouselPhotos) && home.carouselPhotos.length > 0
            ? home.carouselPhotos.map(photo => photo.url)
            : home.imgSrc ? [home.imgSrc] : [];

          return {
            id: home.providerListingId || home.zpid || `${home.addressStreet || 'unknown'}-${Math.random()}`,
            address: home.addressStreet || 'Unknown',
            city: home.addressCity || '',
            state: home.addressState || '',
            zip: home.addressZipcode || '',
            images,
            price: home.unformattedPrice || 0,
            beds: home.beds || 0, 
            baths: home.baths || 0,
            livingArea: home.area || 0,
            zpid: home.zpid,
            listingStatus: home.listingStatus
          };
        });
        
        setHomes(transformedHomes);
        setMessage(`Showing ${transformedHomes.length} homes in ${selectedCity}`);
      }
    } catch (err) {
      console.error('Error fetching homes:', err);
      setError(`Failed to fetch homes: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Function to manually refresh listings
  const refreshListings = async () => {
    if (!selectedCity) {
      setMessage('Please enter a city name first');
      return;
    }
    
    setRefreshing(true);
    setMessage(`Refreshing listings for ${selectedCity}...`);
    
    try {
      // Call the refresh endpoint
      const refreshResponse = await axios.get(`${API_URL}/zillow/refresh/${selectedCity}`);
      
      if (refreshResponse.data.success) {
        setMessage(`Successfully refreshed ${refreshResponse.data.refreshed} listings for ${selectedCity}`);
        
        // Update our listing display with the new data
        if (refreshResponse.data.listings?.length > 0) {
          // Transform homes with the simple approach that we know works
          const transformedHomes = refreshResponse.data.listings.map(home => {
            // Extract images from carouselPhotos exactly as in Swipe feature
            const images = Array.isArray(home.carouselPhotos) && home.carouselPhotos.length > 0
              ? home.carouselPhotos.map(photo => photo.url)
              : home.imgSrc ? [home.imgSrc] : [];

            return {
              id: home.providerListingId || home.zpid || `${home.addressStreet || 'unknown'}-${Math.random()}`,
              address: home.addressStreet || 'Unknown',
              city: home.addressCity || '',
              state: home.addressState || '',
              zip: home.addressZipcode || '',
              images,
              price: home.unformattedPrice || 0,
              beds: home.beds || 0,
              baths: home.baths || 0,
              livingArea: home.area || 0,
              zpid: home.zpid,
              listingStatus: home.listingStatus
            };
          });
          
          setHomes(transformedHomes);
        } else {
          // If no listings in response, fetch them again
          await fetchHomes(true);
        }
      } else {
        setMessage('Error refreshing listings. Please try again.');
      }
    } catch (err) {
      console.error('Error refreshing listings:', err);
      setError(`Failed to refresh listings: ${err.message}`);
      setMessage('');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle city change submission
  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setSelectedCity(inputCity.trim());
    }
  };
  
  // Handle liking/disliking a home
  const handleAction = async (homeId, action) => {
    if (!userId || !homeId) {
      console.error('Missing userId or homeId:', { userId, homeId });
      setMessage('You need to be logged in to save homes');
      return;
    }
    
    console.log(`Handling action: ${action} for home ${homeId}`);
    
    try {
      await axios.post(`${API_URL}/swipe`, {
        userId,
        homeId,
        action
      });
      
      // Remove the home from the current list
      setHomes(prev => {
        const removed = prev.filter(home => home.id !== homeId);
        console.log(`Removed home ${homeId}, ${prev.length - removed.length} homes removed`);
        return removed;
      });
      
      // If we're running out of homes, get more
      if (homes.length <= 5) {
        console.log('Running low on homes, fetching more...');
        fetchHomes(true);
      }
      
      setMessage(`Home ${action === 'like' ? 'liked' : 'skipped'}`);
    } catch (err) {
      console.error('Error recording action:', err);
      setError(`Failed to record ${action}: ${err.message}`);
    }
  };
  
  // Initial loading state (waiting for location)
  if (!locationLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Detecting your location...</p>
      </div>
    );
  }
  
  // Loading state (after location is determined)
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">
          {selectedCity ? `Loading homes in ${selectedCity}...` : 'Loading...'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* City selection and refresh controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleCitySubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            placeholder="Enter city name"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
          <button 
            type="button"
            onClick={refreshListings}
            disabled={refreshing || !selectedCity}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </form>
        
        {message && (
          <p className="text-sm text-center text-blue-600">{message}</p>
        )}
        
        {error && (
          <p className="text-sm text-center text-red-600 mt-2">{error}</p>
        )}
      </div>
      
      {/* Display homes grid */}
      {(homes.length === 0 && !loading) || !selectedCity ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">
            {selectedCity ? `No Homes Found in ${selectedCity}` : 'Enter a City to Search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedCity 
              ? `We couldn't find any homes in ${selectedCity}. Try another city or refresh the listings.`
              : 'Enter a city name above and click Search to find available homes.'}
          </p>
          {selectedCity && (
            <button
              onClick={refreshListings}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Refresh Listings
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homes.map((home) => (
            <div 
              key={home.id || Math.random().toString()} 
              className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
              style={{ height: 'fit-content', minHeight: '500px' }}
            >
              {/* Image carousel container with fixed height */}
              <div style={{ height: '300px', position: 'relative' }}>
                {/* Add image count for debugging */}
                {console.log(`Home ${home.id} has ${home.images?.length || 0} images`)}
                
                <BasicImageCarousel 
                  images={home.images} 
                  altText={home.address || 'Home'} 
                  onImageLoadError={handleImageLoadError}
                />
              </div>
              
              {/* Home details */}
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-lg mb-1 truncate">
                  {home.address || 'Address not available'}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {home.city || ''}{home.state ? `, ${home.state}` : ''}
                  {home.zip ? ` ${home.zip}` : ''}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xl font-bold">${formatPrice(home.price)}</p>
                  {home.listingStatus && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {home.listingStatus}
                    </span>
                  )}
                </div>
                
                <div className="flex text-sm text-gray-600 gap-3 mb-4">
                  <span>{home.beds || 0} bd</span>
                  <span>•</span>
                  <span>{home.baths || 0} ba</span>
                  <span>•</span>
                  <span>{home.livingArea || 0} sqft</span>
                </div>
                
                <div className="flex justify-between mt-auto">
                  <button
                    onClick={() => handleAction(home.id, 'dislike')}
                    className="flex-1 mr-2 py-2 border border-red-300 text-red-500 rounded hover:bg-red-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleAction(home.id, 'like')}
                    className="flex-1 ml-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectHomeList; 