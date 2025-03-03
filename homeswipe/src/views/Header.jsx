import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/solid"; // Import Heroicons

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="flex justify-between items-center px-6 py-4">
        
        {/* Left: Home Icon + HomeSwipe */}
        <Link to="/" className="flex items-center space-x-2 text-black font-bold text-xl">
          <HomeIcon className="h-6 w-6 text-blue-600" /> {/* House Icon */}
          <span>HomeSwipe</span>
        </Link>

        {/* Right: Login & Signup Buttons */}
        <div className="flex space-x-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
            Log In
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}