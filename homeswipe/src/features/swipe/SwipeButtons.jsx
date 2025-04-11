// SwipeButtons.jsx
import React, { useState } from 'react';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import FavoriteIcon from '@mui/icons-material/Favorite';

function SwipeButtons({ onLike, onDislike }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleMouseEnter = (btnType) => setHoveredBtn(btnType);
  const handleMouseLeave = () => setHoveredBtn(null);

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.button,
          ...(hoveredBtn === 'dislike' ? styles.hoveredDislike : {}),
        }}
        onClick={onDislike}
        onMouseEnter={() => handleMouseEnter('dislike')}
        onMouseLeave={handleMouseLeave}
      >
        <HeartBrokenIcon style={styles.icon} />
      </button>

      <button
        style={{
          ...styles.button,
          ...(hoveredBtn === 'like' ? styles.hoveredLike : {}),
        }}
        onClick={onLike}
        onMouseEnter={() => handleMouseEnter('like')}
        onMouseLeave={handleMouseLeave}
      >
        <FavoriteIcon style={styles.icon} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20rem',
    marginTop: '2.5rem',
  },
  button: {
    width: '7rem',
    height: '7rem',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    background: 'rgba(7, 46, 218, 0.84)',
    border: 'none',
    transition: 'all 0.3s ease',
  },
  hoveredLike: {
    boxShadow: '0 0 20px 5px rgba(0,255,0,0.5)', // green glow
    transform: 'scale(1.05)',
  },
  hoveredDislike: {
    boxShadow: '0 0 20px 5px rgba(255,0,0,0.5)', // red glow
    transform: 'scale(1.05)',
  },
  icon: {
    fontSize: '2rem',
    color: 'white',
  },
};

export default SwipeButtons;