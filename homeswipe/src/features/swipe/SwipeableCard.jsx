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

      {/* Overlay text */}
      <div className="cardOverlay">
        <h3>{card.name}</h3>
        <p>{card.price}</p>
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