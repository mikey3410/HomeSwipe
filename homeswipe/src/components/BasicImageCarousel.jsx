import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Image as ImageIcon } from 'react-feather';

/**
 * Simple and reliable image carousel component
 */
const BasicImageCarousel = ({ images, altText = "Property image", onImageLoadError }) => {
  // Validate and filter images to ensure we only have strings
  const validImages = Array.isArray(images) 
    ? images.filter(img => img && typeof img === 'string')
    : [];
    
  // State for current image index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgLoadError, setImgLoadError] = useState(false);
  
  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
        <ImageIcon size={48} className="text-gray-400 mb-2" />
        <div className="text-gray-500 text-center">
          <p>No images available</p>
        </div>
      </div>
    );
  }

  // Navigation functions
  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % validImages.length;
    console.log(`Moving to image ${nextIndex} of ${validImages.length}`);
    setCurrentIndex(nextIndex);
    setImgLoadError(false);
  };
  
  const goToPrev = () => {
    const prevIndex = (currentIndex - 1 + validImages.length) % validImages.length;
    console.log(`Moving to image ${prevIndex} of ${validImages.length}`);
    setCurrentIndex(prevIndex);
    setImgLoadError(false);
  };
  
  // Handle image error
  const handleImageError = () => {
    console.error(`Failed to load image: ${validImages[currentIndex]}`);
    setImgLoadError(true);
    
    if (onImageLoadError) {
      onImageLoadError({
        url: validImages[currentIndex],
        index: currentIndex,
        error: new Error("Image failed to load")
      });
    }
  };
  
  return (
    <div className="w-full h-full relative">
      {/* Main image display */}
      <div className="w-full h-full relative">
        {imgLoadError ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
            <AlertCircle size={48} className="text-red-500 mb-2" />
            <div className="text-gray-500 text-center px-4">
              <p>Image could not be loaded</p>
            </div>
          </div>
        ) : (
          <img
            src={validImages[currentIndex]}
            alt={`${altText} ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>
      
      {/* Navigation buttons - only show if we have multiple images */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70"
            style={{ zIndex: 10 }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70"
            style={{ zIndex: 10 }}
          >
            <ChevronRight size={24} />
          </button>
          
          {/* Image counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
            {currentIndex + 1} / {validImages.length}
          </div>
        </>
      )}
    </div>
  );
};

export default BasicImageCarousel; 