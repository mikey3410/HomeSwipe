// src/views/LearnPage.jsx
import React from 'react';

function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-blue-50 to-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
          Why Choose HomeSwipe?
        </h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          At HomeSwipe, we make finding your dream home simple, fast, and fun.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-purple-100">
          <h3 className="text-2xl font-bold text-purple-600 mb-3">🔍 Filter Smart</h3>
          <p className="text-gray-600">
            Choose your ideal location, price range, and home type. We help you filter out the noise so you get only the homes that match your vibe.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-blue-100">
          <h3 className="text-2xl font-bold text-blue-600 mb-3">📲 Swipe Intuitively</h3>
          <p className="text-gray-600">
            Just like your favorite dating app — but for homes. Swipe left or right to save or skip listings effortlessly.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-purple-100">
          <h3 className="text-2xl font-bold text-purple-600 mb-3">📬 Connect Instantly</h3>
          <p className="text-gray-600">
            Found a favorite? Instantly connect with agents or schedule a visit. We streamline the process for you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LearnPage;