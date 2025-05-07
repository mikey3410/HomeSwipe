import React, { useState, useEffect } from "react";
import DirectHomeList from "../components/DirectHomeList";
import ModelInsights from "../components/ModelInsights";
import RecommendedHomes from "../components/RecommendedHomes";
import { auth } from "../firebase/config"; // Correct import for auth

function Home() {
  const [user, setUser] = useState(null);
  const [selectedHome, setSelectedHome] = useState(null);
  const [activeTab, setActiveTab] = useState("browse"); // "browse" or "recommendations"

  // Set up auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handler for when a home is selected
  const handleHomeSelect = (home) => {
    setSelectedHome(home);
    // You could open a modal with details here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Home</h1>
          <div className="flex gap-3">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                // Refresh the page to start a new search
                window.location.reload();
              }}
            >
              New Search
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        {user && (
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "browse"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("browse")}
            >
              Browse
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "recommendations"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("recommendations")}
            >
              Recommendations
            </button>
          </div>
        )}

        {/* Model insights for recommendations - only show when logged in */}
        {user && activeTab === "recommendations" && (
          <ModelInsights userId={user.uid} />
        )}

        {/* Content based on selected tab */}
        {activeTab === "recommendations" && user ? (
          <RecommendedHomes userId={user.uid} onHomeSelect={handleHomeSelect} />
        ) : (
          /* Home Listings - Direct Implementation */
          <DirectHomeList userId={user?.uid} />
        )}

        {/* Development Tools - Remove in production */}
        
      </div>
    </div>
  );
}

export default Home;
