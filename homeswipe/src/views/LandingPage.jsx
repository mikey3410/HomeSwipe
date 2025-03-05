import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Function to import all images from the media folder
    const importAllImages = async () => {
      try {
        // This uses Vite's import.meta.glob to get all images from the media folder
        const imageFiles = import.meta.glob('../../media/*.{png,jpg,jpeg,svg}');
        const imagePromises = Object.values(imageFiles).map(importFile => importFile());
        
        const loadedImages = await Promise.all(imagePromises);
        // Extract the default export (image URL) from each module
        setImages(loadedImages.map(module => module.default).slice(0, 10)); // Limit to exactly 10 images
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    importAllImages();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Background image grid - only covers part of the screen to leave room for footer */}
      <div className="absolute inset-0 bottom-16 bg-black/40 z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 h-full">
          {images.length > 0 ? (
            // Use actual images from media folder - exactly 10 images
            images.map((image, index) => (
              <div 
                key={index} 
                className="bg-cover bg-center h-full" 
                style={{ backgroundImage: `url(${image})` }}
              />
            ))
          ) : (
            // Fallback while images are loading - exactly 10 placeholders
            Array(10).fill().map((_, i) => (
              <div 
                key={i} 
                className="bg-gray-300 h-full"
              />
            ))
          )}
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-grow text-white px-4">
        {/* Enhanced title with gradient and glow */}
        <div className="relative mb-12 group">
          <h1 className="text-6xl md:text-8xl font-bold text-blue-400 text-center bg-clip-text drop-shadow-lg">
            Home <span className="text-blue-400">Swipe</span> Home
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-lg blur-xl opacity-30 -z-10"></div>
        </div>
        
        <div className="flex flex-col gap-5 w-full max-w-xs">
          {/* Create account button with glow effect */}
          <Link to="/login" className="group relative inline-flex items-center justify-center w-full">
            <span className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300"></span>
            <span className="relative w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-full font-medium text-center transition-all duration-300 group-hover:shadow-lg border border-gray-700">
              Create account
            </span>
          </Link>
          
          {/* Log in button with subtle glow */}
          <Link to="/login" className="group relative inline-flex items-center justify-center w-full">
            <span className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></span>
            <span className="relative w-full bg-white hover:bg-gray-50 text-gray-800 py-3 px-6 rounded-full font-medium text-center transition-all duration-300 group-hover:shadow-md border border-gray-200">
              Log in
            </span>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-20 bg-gray-900 text-gray-400 py-4 px-6 w-full">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="mb-2 md:mb-0">
            © 2023 HomeSwipe. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;