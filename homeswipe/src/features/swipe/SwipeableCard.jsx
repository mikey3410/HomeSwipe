// SwipeableCard.jsx (updated with persistent overlays)
import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import Modal from '@mui/material/Modal';
import RoomIcon from '@mui/icons-material/Room';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import './ImageCarousel.css';

const MAPS_API_KEY = "AIzaSyDJECvM3jb_FcjFVBSRKHkdxCJgeimdPHY";

const mapContainerStyle = {
  width: '75vw',
  height: '75vh',
  borderRadius: '20px',
  overflow: 'hidden',
  margin: 'auto',
  marginTop: '5vh',
  boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
  position: 'relative',
  background: '#fff'
};

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
  const [mapOpen, setMapOpen] = useState(false);

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

  const handleLocationClick = (e) => {
    e.stopPropagation();
    setMapOpen(true);
  };

  const handleCloseMap = () => setMapOpen(false);

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

  // For now, show a Google Map centered on the house's address
  const address = encodeURIComponent(
    card.fullAddress ||
    `${card.name || ''}, ${card.city || ''}, ${card.state || ''} ${card.zip || ''}`
  );
  const mapUrl = `https://maps.google.com/maps?q=${address}&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      <Modal
        open={mapOpen}
        onClose={handleCloseMap}
        aria-labelledby="map-modal-title"
        aria-describedby="map-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={mapContainerStyle}>
          <iframe
            title="Google Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0, borderRadius: '20px' }}
            src={mapUrl}
            allowFullScreen
          ></iframe>
          <button
            onClick={handleCloseMap}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 22,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
            aria-label="Close map"
          >×</button>
        </div>
      </Modal>

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
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            fontWeight: '500',
            zIndex: 2
          }}
        >
          🛏 {card.bedrooms || 'N/A'} Beds • 🛁 {card.bathrooms || 'N/A'} Baths
        </div>

        {/* Drag indicator with emoji and text */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fff',
            padding: '0.25rem 0.5rem',
            borderRadius: '999px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: '0.70rem',
            color: '#444',
            fontWeight: 500,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            zIndex: 2,
            userSelect: 'none',
            minWidth: '100px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            justifyContent: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1.25rem', marginRight: '0.2rem' }}>⬆️</span>
          <span>Swipe up for details</span>
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

        {/* Top-right overlays: price and address in separate boxes */}
        <div
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
            minWidth: '180px',
            maxWidth: '320px',
            zIndex: 2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 'bold',
              fontFamily: 'system-ui, sans-serif',
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
            }}
          >
            {card.price ? `$${Number(card.price).toLocaleString()}` : 'N/A'}
          </div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 500,
              fontFamily: 'system-ui, sans-serif',
              wordBreak: 'break-word',
              width: '100%',
            }}
          >
            {card.fullAddress || `${card.name || ''}, ${card.city || ''}, ${card.state || ''} ${card.zip || ''}`}
          </div>
        </div>
      </motion.div>
    </>
  );
});

export default SwipeableCard;