import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BasicImageCarousel from './BasicImageCarousel';
import { fetchRecommendations, recordSwipe } from '../api/recommender';
import { fetchListings, refreshListings } from '../api/zillowbase';

// Handler function for image load errors in the carousel
const handleImageLoadError = ({ url, error, index }) => {
  console.error(`Image load error at index ${index}:`, { url, errorMessage: error?.message || 'Unknown error' });
};

// Simple implementation that avoids hook ordering issues
const RecommendedHomes = ({ userId, onHomeSelect }) => {
  // 1. All useState hooks first, always in the same order
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsMoreSwipes, setNeedsMoreSwipes] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [location, setLocation] = useState({ city: '', state: '' });
  const [refreshMessage, setRefreshMessage] = useState('');
  
  // 2. Define regular functions (not using hooks)
  function handleRefreshRecommendations() {
    loadRecommendations();
  }
  
  async function handleSwipe(homeId, action) {
    if (!userId || !homeId) return;
    
    try {
      await recordSwipe(userId, homeId, action);
      
      // Remove swiped home from recommendations
      setRecommendations(prev => 
        prev.filter(home => home.id !== homeId)
      );
      
      // If we're running low on recommendations, fetch more
      if (recommendations.length <= 3) {
        loadRecommendations();
      }
    } catch (err) {
      console.error('Failed to record swipe:', err);
      setError(err.message);
    }
  }
  
  async function handleRefreshListings() {
    if (!location.city) {
      setRefreshMessage('Please enter a city name to refresh listings');
      return;
    }
    
    setIsRefreshing(true);
    setRefreshMessage('');
    
    try {
      const result = await refreshListings(location);
      setRefreshMessage(`Successfully refreshed ${result.refreshed} listings for ${location.city}`);
      loadRecommendations(true);
    } catch (err) {
      setRefreshMessage(`Error refreshing listings: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  }
  
  // 3. Use useEffect for data loading
  async function loadRecommendations(forceRefresh = false) {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    setNeedsMoreSwipes(false);
    
    try {
      // Try getting personalized recommendations
      let homes = [];
      try {
        const rawHomes = await fetchRecommendations(userId, 10);
        
        // Transform homes to ensure proper image extraction
        homes = rawHomes.map(home => {
          // Extract images consistently with DirectHomeList approach
          const images = Array.isArray(home.carouselPhotos) && home.carouselPhotos.length > 0
            ? home.carouselPhotos.map(photo => photo.url)
            : home.imgSrc ? [home.imgSrc] : [];
            
          return {
            ...home,  // Keep all original properties
            images: images, // Add standardized images array
          };
        });
        
      } catch (err) {
        console.warn('Recommendation error:', err);
        
        // Check if this is a "need more swipes" error
        if (err.message && err.message.includes('Need more swipes')) {
          setNeedsMoreSwipes(true);
          
          // If we don't have enough swipes, get some default listings
          if (location.city) {
            console.log('Falling back to default listings for', location.city);
            const defaultListings = await fetchListings({
              city: location.city,
              forceRefresh
            });
            
            // Transform the default listings the same way
            homes = defaultListings.map(home => {
              const images = Array.isArray(home.carouselPhotos) && home.carouselPhotos.length > 0
                ? home.carouselPhotos.map(photo => photo.url)
                : home.imgSrc ? [home.imgSrc] : [];
                
              return {
                ...home,
                images: images,
              };
            });
          }
        } else {
          throw err;
        }
      }
      
      setRecommendations(homes);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  // 4. Call useEffect after defining all functions
  useEffect(() => {
    if (userId) {
      loadRecommendations();
    }
  }, [userId]); // No function dependencies that would change between renders
  
  // 5. Render UI based on state
  if (needsMoreSwipes) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold text-yellow-700">We Need Your Preferences</h3>
        <p className="text-yellow-600">
          Please swipe on at least 5 homes so we can learn your preferences and provide personalized recommendations.
        </p>
        
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">Refresh Listings</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="City"
              value={location.city}
              onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
              className="flex-1 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="State (optional)"
              value={location.state}
              onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
              className="flex-1 px-3 py-2 border rounded"
            />
          </div>
          
          <button
            onClick={handleRefreshListings}
            disabled={isRefreshing || !location.city}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isRefreshing ? 'Refreshing...' : 'Get Fresh Listings'}
          </button>
          
          {refreshMessage && (
            <p className="mt-2 text-sm text-center text-blue-600">{refreshMessage}</p>
          )}
        </div>
      </div>
    );
  }

  if (error && !needsMoreSwipes) {
    return (
      <div className="p-4 bg-red-50 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold text-red-700">Oops!</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={handleRefreshRecommendations}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Finding homes for you...</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold">No Recommendations Yet</h3>
        <p className="text-gray-600 mb-4">
          We don't have any recommendations for you right now. Try refreshing listings for your area.
        </p>
        
        <div className="p-4 bg-white rounded border">
          <h4 className="font-medium mb-2">Refresh Listings</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="City"
              value={location.city}
              onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
              className="flex-1 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="State (optional)"
              value={location.state}
              onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
              className="flex-1 px-3 py-2 border rounded"
            />
          </div>
          
          <button
            onClick={handleRefreshListings}
            disabled={isRefreshing || !location.city}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isRefreshing ? 'Refreshing...' : 'Get Fresh Listings'}
          </button>
          
          {refreshMessage && (
            <p className="mt-2 text-sm text-center text-blue-600">{refreshMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recommended For You</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{recommendations.length} properties</span>
          <button 
            onClick={handleRefreshRecommendations}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Refresh controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-sm font-medium mb-2">Get Fresh Listings</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="City"
            value={location.city}
            onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
            className="flex-1 px-3 py-2 border rounded text-sm"
          />
          <input
            type="text"
            placeholder="State"
            value={location.state}
            onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
            className="w-24 px-3 py-2 border rounded text-sm"
          />
          <button
            onClick={handleRefreshListings}
            disabled={isRefreshing || !location.city}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 text-sm whitespace-nowrap"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {refreshMessage && (
          <p className="mt-2 text-xs text-center text-blue-600">{refreshMessage}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((home) => (
          <motion.div
            key={home.id || Math.random().toString()}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
            style={{ height: 'fit-content', minHeight: '500px' }}
          >
            {/* Image carousel container with fixed height */}
            <div 
              className="cursor-pointer"
              onClick={() => onHomeSelect(home)}
              style={{ height: '300px', position: 'relative' }}
            >
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
                <p className="text-xl font-bold">
                  ${typeof home.price === 'number' 
                    ? home.price.toLocaleString() 
                    : (home.unformattedPrice ? parseFloat(String(home.unformattedPrice).replace(/[^0-9.]/g, '')).toLocaleString() : 'Price not available')}
                </p>
                {/* Add match percentage indicator */}
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {Math.round((home.score || 0.5) * 100)}% Match
                </span>
              </div>
              
              <div className="flex text-sm text-gray-600 gap-3 mb-4">
                <span>{home.beds || 0} bd</span>
                <span>•</span>
                <span>{home.baths || 0} ba</span>
                <span>•</span>
                <span>{home.livingArea || home.area || 0} sqft</span>
              </div>
              
              <div className="flex justify-between mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe(home.id, 'dislike');
                  }}
                  className="flex-1 mr-2 py-2 border border-red-300 text-red-500 rounded hover:bg-red-50"
                >
                  Skip
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe(home.id, 'like');
                  }}
                  className="flex-1 ml-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Like
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedHomes; 