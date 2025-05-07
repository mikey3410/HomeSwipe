import { useState, useEffect, useCallback } from 'react';
import { fetchRecommendations, recordSwipe } from '../api/recommender';
import { fetchListings } from '../api/zillowbase';

/**
 * React hook for handling home recommendations and swipe interactions
 * @param {string} userId - The current user's ID
 * @param {number} limit - Maximum number of recommendations to fetch
 * @returns {Object} Hook state and functions
 */
export function useRecommendations(userId, limit = 10) {
  // All state hooks must be called unconditionally at the top
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsMoreSwipes, setNeedsMoreSwipes] = useState(false);
  const [recentCities, setRecentCities] = useState([]);
  
  // Fetch recommendations - define the callback outside of any conditions
  const fetchUserRecommendations = useCallback(async (forceRefresh = false) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    setNeedsMoreSwipes(false);
    
    try {
      // Try getting personalized recommendations first
      let homes = [];
      try {
        homes = await fetchRecommendations(userId, limit);
      } catch (err) {
        console.warn('Recommendation error:', err);
        
        // Check if this is a "need more swipes" error
        if (err.message && err.message.includes('Need more swipes')) {
          setNeedsMoreSwipes(true);
          
          // If we don't have enough swipes, get some default listings
          if (recentCities.length > 0) {
            console.log('Falling back to default listings for', recentCities[0]);
            const defaultListings = await fetchListings({
              city: recentCities[0],
              forceRefresh // Pass through the force refresh flag
            });
            homes = defaultListings;
          }
        } else {
          throw err; // Re-throw other errors
        }
      }
      
      setRecommendations(homes);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, limit, recentCities]);
  
  // Handle swipe action and record it
  const handleSwipe = useCallback(async (homeId, action) => {
    if (!userId || !homeId) return;
    
    try {
      const response = await recordSwipe(userId, homeId, action);
      
      // Remove swiped home from recommendations
      setRecommendations(prev => 
        prev.filter(home => home.id !== homeId)
      );
      
      // Update recent cities list from the home that was swiped
      const swipedHome = recommendations.find(h => h.id === homeId);
      if (swipedHome && swipedHome.city) {
        setRecentCities(prev => {
          const newCities = [swipedHome.city, ...prev.filter(c => c !== swipedHome.city)].slice(0, 5);
          return newCities;
        });
      }
      
      // If we're running low on recommendations, fetch more
      if (recommendations.length <= 3) {
        fetchUserRecommendations();
      }
      
      return response;
    } catch (err) {
      console.error('Failed to record swipe:', err);
      setError(err.message);
      return false;
    }
  }, [userId, recommendations, fetchUserRecommendations]);
  
  // Initial fetch when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserRecommendations();
    }
  }, [userId, fetchUserRecommendations]);
  
  return {
    recommendations,
    loading,
    error,
    needsMoreSwipes,
    handleSwipe,
    refreshRecommendations: fetchUserRecommendations,
    recentCities
  };
} 