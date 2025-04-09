import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';

const SwipeableCard = forwardRef(({ card, onSwipe, style = {} }, ref) => {
  const [expanded, setExpanded] = useState(false);
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
    // Could open map with card.lat/lng if available
  };

  const styles = {
    iconButton: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      zIndex: 2
    },
    icon: {
      color: '#fff',
      fontSize: '2rem'
    }
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      animate(x, 1000, { duration: 0.5 }).then(() => onSwipe('right', card));
    } else if (info.offset.x < -150) {
      animate(x, -1000, { duration: 0.5 }).then(() => onSwipe('left', card));
    } else if (info.offset.y < -150) {
      animate(y, -300, { duration: 0.5 });
      setExpanded(true);
    } else {
      animate(x, 0, { duration: 0.3 });
      animate(y, 0, { duration: 0.3 });
      setExpanded(false);
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
        position: 'absolute'
      }}
      drag
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0, top: -300, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
    >
      <button style={styles.iconButton} onClick={handleLocationClick}>
        <ShareLocationIcon style={styles.icon} />
      </button>

      <div
    className="cardOverlay"
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
  }}
>
  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
  {card.price ? `$${Number(card.price).toLocaleString()}` : 'N/A'}
  </p>
  </div>

{/* Info overlay at bottom of card */}
  <div style={{
  position: 'absolute',
  bottom: '1rem',
  left: '1rem',
  color: '#fff',
  background: 'rgba(0, 0, 0, 0.6)',
  borderRadius: '12px',
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  fontWeight: '500'
}}>
  🛏 {card.bedrooms || 'N/A'} Beds • 🛁 {card.bathrooms || 'N/A'} Baths
  </div>


      {/* Expanded info */}
      {expanded && (
        <div className="cardDetails">
          <p>🛏 {card.bedrooms || 0} Beds</p>
          <p>🛁 {card.bathrooms || 0} Baths</p>
          {/* You could also add square footage or other fields */}
        </div>
      )}
    </motion.div>
  );
});

export default SwipeableCard;