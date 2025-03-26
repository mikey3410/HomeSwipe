import React from 'react';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import FavoriteIcon from '@mui/icons-material/Favorite';

function SwipeButtons({ onLike, onDislike }) {
  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={onDislike}>
        <HeartBrokenIcon style={styles.icon} />
      </button>
      <button style={styles.button} onClick={onLike}>
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
    width: '7rem', // Set width to a fixed value
    height: '7rem', // Set height to the same value for a circular shape
    borderRadius: '50%', // Ensures the button is circular
    display: 'flex', // Aligns content inside the button
    justifyContent: 'center', // Centers icons horizontally
    alignItems: 'center', // Centers icons vertically
    cursor: 'pointer',
    background: 'rgba(7, 46, 218, 0.84)',
    border: 'outline', // Remove default border
    borderColor: 'black',
  },
  icon: {
    fontSize: '1.5rem', // Adjust icon size as needed
    color: 'white', // Change icon color to white
  },
};

export default SwipeButtons;