import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCarousel = ({ images, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // If there are no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }
  
  // If there's only one image, just show it without controls
  if (images.length === 1) {
    return (
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        <img 
          src={images[0]} 
          alt={altText || 'Property image'} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  // Stop event propagation to prevent triggering parent click events
  const handleButtonClick = (event, callback) => {
    event.stopPropagation();
    callback();
  };
  
  return (
    <div className="relative w-full h-48 bg-gray-200 overflow-hidden group">
      <AnimatePresence initial={false}>
        <motion.img 
          key={currentIndex}
          src={images[currentIndex]} 
          alt={`${altText || 'Property'} - Image ${currentIndex + 1} of ${images.length}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
      
      {/* Image indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => handleButtonClick(e, () => setCurrentIndex(index))}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation arrows - only shown on hover */}
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => handleButtonClick(e, prevImage)}
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => handleButtonClick(e, nextImage)}
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Image counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageCarousel; 