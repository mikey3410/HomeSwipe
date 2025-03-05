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
        setImages(loadedImages.map(module => module.default));
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    importAllImages();
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      {/* Background image grid */}
      <div className="absolute inset-0 bg-black/40 z-10">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-1 opacity-80">
          {images.length > 0 ? (
            // Use actual images from media folder
            images.map((image, index) => (
              <div 
                key={index} 
                className="aspect-[3/4] bg-cover bg-center" 
                style={{ backgroundImage: `url(${image})` }}
              />
            ))
          ) : (
            // Fallback while images are loading
            Array(10).fill().map((_, i) => (
              <div 
                key={i} 
                className="aspect-[3/4] bg-gray-300"
              />
            ))
          )}
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-white px-4">
        {/* Enhanced title with gradient and glow */}
        <div className="relative mb-12 group">
          <h1 className="text-6xl md:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 drop-shadow-lg">
            Swipe Home<span className="text-blue-400">®</span>
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
    </div>
  );
}

export default LandingPage;