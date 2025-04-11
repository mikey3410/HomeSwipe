import React, { forwardRef, memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './ImageCarousel.css';

const SwipeableCard = forwardRef(({ card, onSwipe, onNextImage, onPrevImage, style = {} }, ref) => {
  // Ensure images is always an array
  const images = Array.isArray(card.images) ? card.images : [card.images];
  
  // Track the currently displayed image URL
  const [displayedImageUrl, setDisplayedImageUrl] = useState('');
  // Track if the next image is loaded
  const [isLoading, setIsLoading] = useState(true);
  
  // Update displayed image when currentImageIndex changes
  useEffect(() => {
    setIsLoading(true);
    
    // Get the current image URL
    const currentImageUrl = typeof images[card.currentImageIndex] === 'string'
      ? images[card.currentImageIndex]
      : images[card.currentImageIndex]?.url || '';
      
    // Preload the image
    const img = new Image();
    img.onload = () => {
      setDisplayedImageUrl(currentImageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setDisplayedImageUrl('../../../media/wiktor-kaczmarek-4j0v0j0j0j0-unsplash.jpg');
      setIsLoading(false);
    };
    img.src = currentImageUrl;
  }, [card.currentImageIndex, images]);

  return (
    <motion.div
      ref={ref}
      className="card"
      style={{
        ...style,
        backgroundImage: `url(${displayedImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '1rem',
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: isLoading ? 0.7 : 1, // Slight opacity during loading
        transition: 'background-image 0.5s ease-in-out, opacity 0.3s ease-in-out',
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={(event, info) => {
        if (info.offset.x > 150) onSwipe('right', card);
        else if (info.offset.x < -150) onSwipe('left', card);
      }}
    >
      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            className="carousel-button prev"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoading) onPrevImage(card.zpid, card.currentImageIndex);
            }}
            disabled={isLoading}
            aria-label="Previous image"
          ></button>
          <button
            className="carousel-button next"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoading) onNextImage(card.zpid, card.currentImageIndex);
            }}
            disabled={isLoading}
            aria-label="Next image"
          ></button>
        </>
      )}

      {/* Image Counter */}
      <div className="image-counter">
        {images.length > 0
          ? `${card.currentImageIndex + 1} / ${images.length}`
          : 'No images'}
      </div>
    </motion.div>
  );
});

export default memo(SwipeableCard);