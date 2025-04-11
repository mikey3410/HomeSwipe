//SwipeableCard.jsx
import React, { forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';

const SwipeableCard = forwardRef(({ card, onSwipe, onExpand, style = {} }, ref) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);

  useImperativeHandle(ref, () => ({
    swipe: (direction) => {
      if (direction === 'right') {
        animate(x, 1000, { duration: 0.5 }).then(() => onSwipe('right', card));
      } else if (direction === 'left') {
        animate(x, -1000, { duration: 0.5 }).then(() => onSwipe('left', card));
      }
    }
  }));

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
      className="card"
      style={{
        x,
        y,
        rotate,
        backgroundImage: `url(${card.img || 'https://via.placeholder.com/400x300'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '1rem',
        position: 'absolute',
        width: '100%',
        height: '100%',
        ...style
      }}
      drag
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0, top: -300, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
    >
      {/* Location Icon */}
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

      {/* Price & Address Badge */}
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
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        <p>
  {card.price
    ? `$${Number(card.price).toLocaleString()}`
    : card.unformattedPrice
      ? `$${Number(card.unformattedPrice).toLocaleString()}`
      : 'N/A'}
</p>
         <p className="text-white text-sm mt-1">{card.fullAddress}</p>
        </div>
      </div>

      {/* Beds & Baths Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          fontWeight: '500'
        }}
      >
        🛏 {card.bedrooms || 'N/A'} Beds • 🛁 {card.bathrooms || 'N/A'} Baths
      </div>

      {/* Swipe-up hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '-1.5rem',
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
    </motion.div>
  );
});

export default SwipeableCard;