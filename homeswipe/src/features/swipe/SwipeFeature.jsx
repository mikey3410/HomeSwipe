import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { fetchListings } from './../../api/zillowbase.js'; // Adjust the import path as necessary
import NavBar from './Navbar';
import SwipeButtons from './SwipeButtons';
import SwipeableCard from './SwipeableCard';
import './SwipeFeature.css';

import EditLocationIcon from '@mui/icons-material/EditLocation';
import UndoIcon from '@mui/icons-material/Undo';
import StarsIcon from '@mui/icons-material/Stars';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

function SwipeFeatureComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [swipedCards, setSwipedCards] = useState([]);
  const cardRef = useRef(null);

  // Retrieve current user from Firebase Auth
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const currentUserId = currentUser ? currentUser.uid : 'unknown';

  // Helper function to record a swipe to the backend
  async function recordSwipe(userId, homeId, action) {
    try {
      const response = await axios.post('http://localhost:5001/api/swipe', {
        userId,
        homeId,
        action,
      });
      console.log('Swipe recorded:', response.data);
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  }

  // Load listings from router state or sessionStorage
  useEffect(() => {
    async function loadListings() {
      let listings = location.state?.listings;
      if (!listings) {
        const stored = sessionStorage.getItem('listings');
        if (stored) {
          listings = JSON.parse(stored);
        }
      }

      // If listings exist, transform them into card format
      if (listings && listings.length > 0) {
        const transformed = listings.map(home => {
          // Extract URLs from carouselPhotos
          const images = Array.isArray(home.carouselPhotos) && home.carouselPhotos.length > 0
            ? home.carouselPhotos.map(photo => photo.url) // Extract the `url` property
            :  home.imgSrc; // Fallback image

          return {
            name: home.addressStreet || 'Unknown',
            city: home.addressCity || '',
            state: home.addressState || '',
            zip: home.addressZipcode || '',
            images,
            currentImageIndex: 0, // Initialize currentImageIndex
            price: home.unformattedPrice || 0,
            bedrooms: home.beds || 0,
            bathrooms: home.baths || 0,
            area: home.area || 0,
            zpid: home.providerListingId || home.zpid || `${home.addressStreet || 'unknown'}-${Math.random()}`
          };
        });

        setCards(transformed);
        console.log('Transformed cards:', transformed);
      } else {
        setCards([]);
        console.log('No listings found in router state or sessionStorage');
      }
    }
    loadListings();
  }, [location.state]);

  // Handle swipe action and record it in the backend
  const handleSwipe = (direction, card) => {
    console.log(`Swiped ${direction} on ${card.name}`);
    // Determine swipe action: right = "like", left = "dislike"
    const action = direction === 'right' ? 'like' : 'dislike';
    // Record the swipe action with the actual user ID from Firebase Auth
    recordSwipe(currentUserId, card.zpid, action);
    // Update local state to remove the swiped card
    setSwipedCards(prev => [...prev, card]);
    setCards(prev => prev.filter(c => c.zpid !== card.zpid));
  };

  const handleLike = () => {
    if (cardRef.current) {
      cardRef.current.swipe('right');
    }
  };

  const handleDislike = () => {
    if (cardRef.current) {
      cardRef.current.swipe('left');
    }
  };

  const handlePrevious = () => {
    if (swipedCards.length > 0) {
      const lastCard = swipedCards[swipedCards.length - 1];
      setSwipedCards(prev => prev.slice(0, prev.length - 1));
      setCards(prev => [...prev, lastCard]);
    }
  };

  const handleLiked = () => {
    console.log('Liked Homes button clicked!');
  };

  const handleDisliked = () => {
    console.log('Disliked Homes button clicked!');
  };

  const handleNextImage = (cardId, currentImageIndex) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.zpid !== cardId) return card;

        const newIndex = (card.currentImageIndex + 1) % card.images.length;
        console.log(`Next image clicked for card: ${cardId}`);
        console.log(`Updated currentImageIndex for card ${cardId}:`, newIndex);

        return {
          ...card,
          currentImageIndex: newIndex,
          animationDirection: 1, // Set direction for next
        };
      })
    );
  };

  const handlePrevImage = (cardId, currentImageIndex) => {
    setCards(prevCards =>
      prevCards.map(card => {
        if (card.zpid !== cardId) return card;

        const newIndex = (card.currentImageIndex - 1 + card.images.length) % card.images.length;
        console.log(`Previous image clicked for card: ${cardId}`);
        console.log(`Updated currentImageIndex for card ${cardId}:`, newIndex);

        return {
          ...card,
          currentImageIndex: newIndex,
          animationDirection: -1, // Set direction for previous
        };
      })
    );
  };


  return (
    <div className="App">
      <NavBar />
      <div className="contentContainer">
        <div className="editLocation" onClick={() => navigate('/preferences')} style={{ cursor: 'pointer' }}>
          <EditLocationIcon />
          <h1>
            {cards.length > 0 && cards[0].city && cards[0].state
              ? `${cards[0].city}, ${cards[0].state}`
              : "Your Area"}
          </h1>
        </div>
        <div className="mainContent">
          <div className="cardContainer">
            {cards.map((card, index) => {
              const isTopCard = index === cards.length - 1;
              return (
                <SwipeableCard
                  key={card.zpid}
                  ref={isTopCard ? cardRef : null}
                  card={card}
                  onSwipe={handleSwipe}
                  onNextImage={handleNextImage}
                  onPrevImage={handlePrevImage}
                  style={{ zIndex: cards.length - index }}
                  animationDirection={card.animationDirection || 0} // Pass direction, default 0
                />
              );
            })}
          </div>
          <SwipeButtons onLike={handleLike} onDislike={handleDislike} />
        </div>
        <div className="footerBackground">
          <div className="footerContainer">
            <button onClick={handlePrevious}><UndoIcon /></button>
            <button onClick={handleLiked}><StarsIcon /></button>
            <button onClick={handleDisliked}><NotInterestedIcon /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwipeFeatureComponent;