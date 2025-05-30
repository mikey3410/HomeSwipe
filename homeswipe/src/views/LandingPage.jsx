import React, { useEffect, useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
// Import a static placeholder image - adjust the path as needed
import placeholderImage from '../../media/wiktor-karkocha-WA2uSCbTXkI-unsplash.jpg'

function LandingPage() {
  const [images, setImages] = useState([]);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    const importAllImages = async () => {
      try {
        const imageFiles = import.meta.glob('../../media/*.{png,jpg,jpeg,svg}');
        const imagePromises = Object.values(imageFiles).map(importFile => importFile());
        const loadedImages = await Promise.all(imagePromises);
        setImages(loadedImages.map(module => module.default).slice(0, 10));
        
        // Wait for 250ms before transitioning
        setTimeout(() => {
          setShowPlaceholder(false);
        }, 250);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    importAllImages();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Static placeholder */}
      <div 
        className={`absolute inset-0 bottom-16 bg-black/40 z-10 transition-opacity duration-300 ${
          showPlaceholder ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${placeholderImage})` }}
        />
      </div>

      {/* Dynamic image grid */}
      <div 
        className={`absolute inset-0 bottom-16 bg-black/40 z-10 transition-opacity duration-300 ${
          showPlaceholder ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 h-full">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="bg-cover bg-center h-full" 
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-grow text-white px-4 pt-32">
        <div className="relative mb-12 group">
          <h1 className="text-6xl md:text-9xl font-extrabold text-center tracking-tighter relative inline-block px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-300 text-transparent bg-clip-text">
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative inline-block mr-6">
                <FaHome className="text-5xl md:text-8xl text-white group-hover:text-blue-300 transition-colors z-10 relative drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
              </div>
              <span className="text-6xl md:text-9xl font-extrabold text-center text-blue-400 bg-gradient-to-r from-blue-800 to-blue-300 bg-clip-text text-transparent">
                Home Swipe Home
              </span>
            </div>
          </h1>
        </div>

        <div className="flex flex-col gap-5 w-full max-w-xs">
          <Link to="/login" className="group relative inline-flex items-center justify-center w-full">
            <span className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300"></span>
            <span className="relative w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-full font-medium text-center transition-all duration-300 group-hover:shadow-lg border border-gray-700">
              Create account
            </span>
          </Link>

          <Link to="/login" className="group relative inline-flex items-center justify-center w-full">
            <span className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300"></span>
            <span className="relative w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-full font-medium text-center transition-all duration-300 group-hover:shadow-lg border border-gray-700">
              Log in
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 bg-gray-900 text-gray-400 py-4 px-6 w-full">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="mb-2 md:mb-0">
            © 2025 HomeSwipe. All rights reserved.
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