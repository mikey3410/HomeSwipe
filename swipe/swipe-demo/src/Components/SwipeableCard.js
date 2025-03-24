import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';

const SwipeableCard = forwardRef(({ card, onSwipe }, ref) => {
  const [expanded, setExpanded] = useState(false);
  // Create motion values for horizontal (x) and vertical (y) movement.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Derived rotation based on horizontal drag.
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);

  // Expose an imperative swipe method (horizontal swiping only).
  useImperativeHandle(ref, () => ({
    swipe: (direction) => {
      if (direction === 'right') {
        animate(x, 1000, { duration: 0.5 }).then(() => onSwipe('right', card));
      } else if (direction === 'left') {
        animate(x, -1000, { duration: 0.5 }).then(() => onSwipe('left', card));
      }
    }
  }));

  // Handler for when the location icon button is clicked.
  const handleLocationClick = () => {
    console.log(`Location button clicked on ${card.name}`);
    // Add your functionality here (e.g., open a map or modal)
  };

  // Inline styles for the location button and icon.
  const styles = {
    iconButton: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer'
    },
    icon: {
      color: '#fff',
      fontSize: '2rem'
    }
  };

  // Handle drag end for both horizontal swiping and upward expansion.
  const handleDragEnd = (event, info) => {
    // Check horizontal swipe thresholds first.
    if (info.offset.x > 150) {
      animate(x, 1000, { duration: 0.5 }).then(() => onSwipe('right', card));
    } else if (info.offset.x < -150) {
      animate(x, -1000, { duration: 0.5 }).then(() => onSwipe('left', card));
    } 
    // If swiped upward beyond a threshold, expand the card.
    else if (info.offset.y < -150) {
      animate(y, -300, { duration: 0.5 });
      setExpanded(true);
    } else {
      // Otherwise, reset both x and y values.
      animate(x, 0, { duration: 0.3 });
      animate(y, 0, { duration: 0.3 });
      setExpanded(false);
    }
  };

  return (
    <motion.div
      className="card"
      style={{ x, y, rotate, backgroundImage: `url(${card.url})` }}
      drag
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0, top: -300, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
    >
      {/* Location button in the top-left corner */}
      <button style={styles.iconButton} onClick={handleLocationClick}>
        <ShareLocationIcon style={styles.icon} />
      </button>

      {/* Main card content */}
      <h3>{card.name}</h3>

      {/* Expanded details appear when swiped upward */}
      {expanded && (
        <div className="cardDetails">
          <p>Additional details about the home go here...</p>
        </div>
      )}
    </motion.div>
  );
});

export default SwipeableCard;