// src/views/PreferencesPage.jsx
import React, { useState } from 'react';
import { fetchListings } from '../api/zillowbase';

import { useNavigate } from 'react-router-dom';

function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    state: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    homeType: '',
    minPrice: '',
    maxPrice: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Parse numeric values properly
    const parsedPreferences = {
      ...preferences,
      minPrice: preferences.minPrice ? parseInt(preferences.minPrice) : undefined,
      maxPrice: preferences.maxPrice ? parseInt(preferences.maxPrice) : undefined,
      bedrooms: preferences.bedrooms ? parseInt(preferences.bedrooms) : undefined,
      bathrooms: preferences.bathrooms ? parseInt(preferences.bathrooms) : undefined,
    };
  
    const results = await fetchListings(parsedPreferences);
    console.log(results); // TEMP: see what comes back
  
    // Redirect to swipe page with listings
    navigate('/swipe', { state: { listings: results } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl">
        <h1 className="text-5xl font-extrabold text-purple-700 mb-6 text-center">
          🏡 Let’s Personalize Your Home Search
        </h1>
        <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
          We’re here to make your home search experience smooth, smart, and tailored just for you.
          Set your preferences below and get ready to start swiping and find your perfect match — like real estate Tinder, but better.
        </p>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-gray-700 font-medium">📍 State</label>
            <input
              name="state"
              value={preferences.state}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. CA"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">🏙️ City</label>
            <input
              name="city"
              value={preferences.city}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Los Angeles"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">🛏️ Bedrooms</label>
            <input
              name="bedrooms"
              type="number"
              value={preferences.bedrooms}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 3"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">🛁 Bathrooms</label>
            <input
              name="bathrooms"
              type="number"
              value={preferences.bathrooms}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 2"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">🏠 Home Type</label>
            <select
              name="homeType"
              value={preferences.homeType}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select type</option>
              <option value="SINGLE_FAMILY">Single Family</option>
              <option value="MULTI_FAMILY">Multi-Family</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">💰 Min Price ($)</label>
            <input
              name="minPrice"
              type="number"
              value={preferences.minPrice}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">💸 Max Price ($)</label>
            <input
              name="maxPrice"
              type="number"
              value={preferences.maxPrice}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-center mt-8">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-full shadow-xl text-lg transition"
            >
              🔍 Find Homes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PreferencesPage;
