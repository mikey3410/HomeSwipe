import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const TestRecommender = () => {
  const [userId, setUserId] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const generateTestData = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setDebugInfo(null);

    try {
      console.log(`Generating test data for user ${userId} with ${count} swipes`);
      const response = await axios.post(`${API_BASE_URL}/recommender/debug-add-swipes`, {
        userId,
        count: Number(count)
      });
      
      setResult(response.data);
      console.log('Generated test data:', response.data);
      
      // Auto train after generating data
      console.log(`Training model for user ${userId}`);
      const trainResponse = await axios.post(`${API_BASE_URL}/recommender/train`, { userId });
      console.log('Training response:', trainResponse.data);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRecommendations = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setDebugInfo(null);

    try {
      console.log(`Testing recommendations for user ${userId}`);
      const response = await axios.post(`${API_BASE_URL}/recommender/recommendations`, {
        userId,
        limit: 3 // Small limit for testing
      });
      
      setDebugInfo({
        type: 'recommendations',
        data: response.data
      });
      console.log('Recommendations response:', response.data);
      
    } catch (err) {
      console.error('Error testing recommendations:', err);
      setDebugInfo({
        type: 'error',
        error: err.response?.data || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testModelStats = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setDebugInfo(null);

    try {
      console.log(`Testing model stats for user ${userId}`);
      const response = await axios.get(`${API_BASE_URL}/recommender/model-stats/${userId}`);
      
      setDebugInfo({
        type: 'modelStats',
        data: response.data
      });
      console.log('Model stats response:', response.data);
      
    } catch (err) {
      console.error('Error testing model stats:', err);
      setDebugInfo({
        type: 'error',
        error: err.response?.data || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Recommendation Engine Test Tools</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User ID (e.g. Firebase Auth ID)
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter user ID"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of test swipes to generate
        </label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          min="5"
          max="50"
        />
      </div>
      
      <button
        onClick={generateTestData}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium mb-2
          ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {loading ? 'Processing...' : 'Generate Test Data'}
      </button>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={testRecommendations}
          disabled={loading}
          className="py-2 px-4 rounded-md text-white font-medium bg-green-500 hover:bg-green-600"
        >
          Test Recommendations
        </button>
        
        <button
          onClick={testModelStats}
          disabled={loading}
          className="py-2 px-4 rounded-md text-white font-medium bg-purple-500 hover:bg-purple-600"
        >
          Test Model Stats
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          <p>{result.message}</p>
          <p className="text-sm mt-2">
            You can now test recommendations with this user ID.
          </p>
        </div>
      )}
      
      {debugInfo && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Debug Information</h3>
          <pre className="p-3 bg-gray-50 text-xs rounded-md overflow-auto max-h-64">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestRecommender; 