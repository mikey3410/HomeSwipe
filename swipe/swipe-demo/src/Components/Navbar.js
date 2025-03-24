/*Navbar.js*/
import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VillaIcon from '@mui/icons-material/Villa';

function NavBar() {
  return (
    <nav style={styles.navBar}>
      <div style={styles.navBarInner}>
        <div style={styles.left}>
          <VillaIcon />
        </div>
        <div style={styles.center}>
          <h2 style={styles.logo}>HomeSwipe</h2>
        </div>
        <div style={styles.right}>
          <AccountCircleIcon />
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(to bottom, rgba(48, 48, 48, 1) 0%, rgba(0, 0, 0, 1) 100%)', // Dark gray to black
    color: '#fff',
    zIndex: 999,
  },
  navBarInner: {
    // Constrain and center the nav content
    width: '100%',
    maxWidth: '1000px',
    height: '100%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem',
    boxSizing: 'border-box',
  },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // e.g., add margin or padding here:
    paddingLeft: '2rem', // pushes the icon further to the right
    cursor: 'pointer',
  },
  center: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // e.g., add margin or padding here:
    paddingRight: '2rem', // pushes the icon further to the left
    cursor: 'pointer',
  },
  logo: {
      margin: 0,
      fontFamily: "Lemon, sans-serif", // Replace with your chosen font
      fontSize: '2.1rem',
  },
};

export default NavBar;