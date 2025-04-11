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
          ...(hoveredBtn === 'dislike' ? styles.hovered : {}),
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
          ...(hoveredBtn === 'like' ? styles.hovered : {}),
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
    gap: '5rem',
    flexWrap: 'wrap',
    marginTop: '2rem',
  },
  button: {
    width: '4.5rem',
    height: '4.5rem',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    background: 'white',
    border: '2px solid #d1d5db',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  hovered: {
    transform: 'scale(1.1)',
    borderColor: '#6b5bff',
    background: '#eef2ff',
    boxShadow: '0 6px 16px rgba(107, 91, 255, 0.2)',
  },
  icon: {
    fontSize: '2rem',
    color: '#6b5bff',
  },
};

export default SwipeButtons;