import React, { forwardRef, memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ImageCarousel.css';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

const SwipeableCard = forwardRef(({ card, onSwipe, onNextImage, onPrevImage, animationDirection, style = {} }, ref) => {
  // Ensure images is always an array
  const images = Array.isArray(card.images) ? card.images : [card.images];
  
  // Track the currently displayed image URL
  const [displayedImageUrl, setDisplayedImageUrl] = useState('');
  // Track if the next image is loaded
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
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
  const handleLocationClick = () => {
    console.log(`Location clicked for ${card.name}`);
    // Optional: open map using card.lat/lng if you have it
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      animate(x, 1000, { duration: 0.5 }).then(() => onSwipe('right', card));
    } else if (info.offset.x < -150) {
      animate(x, -1000, { duration: 0.5 }).then(() => onSwipe('left', card));
    } else if (info.offset.y < -150) {
      animate(y, -300, { duration: 0.5 });
      if (onExpand) onExpand(card); // Trigger parent bottom sheet
    } else {
      animate(x, 0, { duration: 0.3 });
      animate(y, 0, { duration: 0.3 });
    }
  };

  return (
    <motion.div
      ref={ref}
      className="card"
      style={{
        ...style,
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '1rem',
        overflow: 'hidden', // Add this to prevent content from showing outside the card
        backgroundColor: '#f0f0f0',
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={(event, info) => {
        if (info.offset.x > 150) onSwipe('right', card);
        else if (info.offset.x < -150) onSwipe('left', card);
      }}
    >
      <AnimatePresence initial={false} custom={animationDirection}>
        <motion.div
          key={card.currentImageIndex} // Use index as key for stability
          className="card-image-container"
          custom={animationDirection}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", duration: 0.3, ease: "easeInOut" },
            opacity: { duration: 0.2 }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${displayedImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Opacity is handled by variants now
          }}
        />
      </AnimatePresence>

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