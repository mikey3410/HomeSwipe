// src/api/recommender.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Fetches personalized home recommendations for a user
 * @param {string} userId - The user ID to get recommendations for
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} - Array of recommended homes with prediction scores
 */
export async function fetchRecommendations(userId, limit = 10) {
  if (!userId) {
    throw new Error('User ID is required to fetch recommendations');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/recommender/recommendations`, {
      userId,
      limit
    });
    
    return response.data.recommendations || [];
  } catch (error) {
    console.error('Failed to fetch recommendations:', error.response?.data || error.message);
    
    // Handle specific errors
    if (error.response?.status === 400 && error.response?.data?.error === 'Not enough swipes yet') {
      throw new Error(`Need more swipes: ${error.response.data.message}`);
    }
    
    throw error;
  }
}

/**
 * Records a user's swipe action on a home
 * @param {string} userId - The user ID 
 * @param {string} homeId - The home ID being swiped on
 * @param {string} action - The swipe action ('like' or 'dislike')
 * @returns {Promise<Object>} - Response from the server
 */
export async function recordSwipe(userId, homeId, action) {
  if (!userId || !homeId || !action) {
    throw new Error('Missing required parameters for recording swipe');
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/swipe`, {
      userId,
      homeId,
      action
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to record swipe:', error.response?.data || error.message);
    throw error;
  }
} 