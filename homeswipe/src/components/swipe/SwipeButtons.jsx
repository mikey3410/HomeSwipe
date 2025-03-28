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
  hovered: {
    background: '#4255ff', // lighter hover color
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  icon: {
    fontSize: '1.5rem',
    color: 'white',
  },
};

export default SwipeButtons;