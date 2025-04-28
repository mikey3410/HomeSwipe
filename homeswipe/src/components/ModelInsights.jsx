import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const ModelInsights = ({ userId }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [modelStats, setModelStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchModelStats = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/recommender/model-stats/${userId}`);
      setModelStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch model stats:', err);
      setError('Could not load model information');
    }
  };

  const trainModel = async () => {
    if (!userId || isTraining) return;
    
    setIsTraining(true);
    setError(null);
    
    try {
      await axios.post(`${API_BASE_URL}/recommender/train`, { userId });
      await fetchModelStats();
    } catch (err) {
      console.error('Failed to train model:', err);
      setError('Could not train model: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsTraining(false);
    }
  };

  // Fetch stats when component mounts
  React.useEffect(() => {
    if (userId) {
      fetchModelStats();
    }
  }, [userId]);

  if (!userId) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recommendation Engine</h3>
        <button
          onClick={fetchModelStats}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={!userId}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 rounded mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-500 uppercase font-semibold">Model Status</p>
          <p className="text-lg font-medium">
            {modelStats?.trained ? 'Trained' : 'Not Trained'}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-500 uppercase font-semibold">Learning From</p>
          <p className="text-lg font-medium">
            {modelStats?.swipeCount || 0} Swipes
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-purple-500 uppercase font-semibold">Last Updated</p>
          <p className="text-lg font-medium">
            {modelStats?.lastTrainedAt 
              ? new Date(modelStats.lastTrainedAt).toLocaleDateString() 
              : 'Never'}
          </p>
        </div>
      </div>

      {modelStats?.featureImportance && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">What Matters Most To You</p>
          <div className="space-y-2">
            {Object.entries(modelStats.featureImportance)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([feature, importance]) => (
                <div key={feature} className="flex items-center">
                  <div className="w-36 text-xs">{formatFeatureName(feature)}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, importance * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <button
        onClick={trainModel}
        disabled={isTraining}
        className={`w-full py-2 px-4 rounded-lg text-white font-medium 
          ${isTraining 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {isTraining ? 'Training...' : 'Retrain My Recommendations'}
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Training helps our AI learn your preferences better
      </p>
    </div>
  );
};

// Helper function to format feature names for display
function formatFeatureName(feature) {
  const nameMap = {
    'beds': 'Bedrooms',
    'baths': 'Bathrooms',
    'price': 'Price',
    'area': 'Square Footage',
    'yearBuilt': 'Year Built',
    'lotSize': 'Lot Size',
    'walkScore': 'Walk Score',
    'SINGLE_FAMILY': 'Single Family Home',
    'CONDO': 'Condo',
    'TOWNHOUSE': 'Townhouse'
  };
  
  return nameMap[feature] || feature;
}

export default ModelInsights; 