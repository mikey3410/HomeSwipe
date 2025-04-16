// SwipeableCard.jsx (updated with persistent overlays)
import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
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

const SwipeableCard = forwardRef(({ card, onSwipe, onExpand, onNextImage, onPrevImage, animationDirection, style = {} }, ref) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);

  const images = Array.isArray(card.images) ? card.images : [card.images];
  const [displayedImageUrl, setDisplayedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    swipe: (direction) => {
      if (direction === 'right') {
        animate(x, 1000, { duration: 0.5 }).then(() => onSwipe('right', card));
      } else if (direction === 'left') {
        animate(x, -1000, { duration: 0.5 }).then(() => onSwipe('left', card));
      }
    }
  }));

  useEffect(() => {
    setIsLoading(true);
    const currentImageUrl = typeof images[card.currentImageIndex] === 'string'
      ? images[card.currentImageIndex]
      : images[card.currentImageIndex]?.url || '';

    const img = new Image();
    img.onload = () => {
      setDisplayedImageUrl(currentImageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setDisplayedImageUrl('https://via.placeholder.com/400x300');
      setIsLoading(false);
    };
    img.src = currentImageUrl;
  }, [card.currentImageIndex, images]);

  const handleLocationClick = () => {
    console.log(`Location clicked for ${card.name}`);
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      animate(x, 1000, { duration: 0.5 }).then(() => onSwipe('right', card));
    } else if (info.offset.x < -150) {
      animate(x, -1000, { duration: 0.5 }).then(() => onSwipe('left', card));
    } else if (info.offset.y < -150) {
      animate(y, -300, { duration: 0.5 });
      if (onExpand) onExpand(card);
    } else {
      animate(x, 0, { duration: 0.3 });
      animate(y, 0, { duration: 0.3 });
    }
  };

  return (
    <motion.div
      className="card"
      style={{
        x,
        y,
        rotate,
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '1rem',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        ...style
      }}
      drag
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0, top: -300, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence initial={false} custom={animationDirection}>
        <motion.div
          key={card.currentImageIndex}
          className="card-image-container"
          custom={animationDirection}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.3, ease: 'easeInOut' },
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
            backgroundPosition: 'center'
          }}
        />
      </AnimatePresence>

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

      {/* Persistent UI overlays below carousel */}
      <div
        style={{
          position: 'absolute',
          bottom: '3.5rem',
          left: '1rem',
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          fontWeight: '500',
          zIndex: 2
        }}
      >
        🛏 {card.bedrooms || 'N/A'} Beds • 🛁 {card.bathrooms || 'N/A'} Baths
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fff',
          padding: '0.4rem 1rem',
          borderRadius: '999px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontSize: '0.8rem',
          color: '#444',
          cursor: 'pointer',
          zIndex: 2
        }}
      >
        ⬆️ Swipe up for details
      </div>

      <div className="image-counter">
        {images.length > 0
          ? `${card.currentImageIndex + 1} / ${images.length}`
          : 'No images'}
      </div>

      <button
        onClick={handleLocationClick}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 2
        }}
      >
        <ShareLocationIcon style={{ color: '#fff', fontSize: '2rem' }} />
      </button>

      <div
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: '12px',
          fontSize: '1.3rem',
          fontWeight: '600',
          fontFamily: 'system-ui, sans-serif',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          minWidth: '150px',
          textAlign: 'center',
          zIndex: 2
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          <p>{card.price ? `$${Number(card.price).toLocaleString()}` : 'N/A'}</p>
          <p className="text-white text-sm mt-1">{card.fullAddress}</p>
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeableCard;