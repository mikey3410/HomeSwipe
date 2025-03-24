import React from "react";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Home</h1>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => {
              // Archive functionality to be implemented
              console.log("Archive clicked");
            }}
          >
            Archive
          </button>
        </div>

        {/* Content placeholder */}
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Content will go here</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
