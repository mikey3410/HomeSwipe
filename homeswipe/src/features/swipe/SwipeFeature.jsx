// SwipeFeature.jsx
import React, { useState, useRef } from 'react';
import NavBar from './Navbar';
import SwipeButtons from './SwipeButtons';
import SwipeableCard from './SwipeableCard';
import './SwipeFeature.css';
import { useLocation } from 'react-router-dom';

import EditLocationIcon from '@mui/icons-material/EditLocation';
import UndoIcon from '@mui/icons-material/Undo';
import StarsIcon from '@mui/icons-material/Stars';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

function SwipeFeatureComponent() {
  const location = useLocation(); // ✅ useLocation moved inside the component
  const listings = location.state?.listings || []; // ✅ you can use it here

  const cardsData = listings.length > 0
  ? listings.map(home => ({
      name: home.address?.streetAddress || "Unknown",
      img: home.imgSrc,
      price: home.price,
      bedrooms: home.bedrooms,
      bathrooms: home.bathrooms,
      zpid: home.zpid
    }))
  : [
      { name: "Example Home 1", img: "url1", zpid: "1" },
      { name: "Example Home 2", img: "url2", zpid: "2" }
    ];

  const [cards, setCards] = useState(cardsData);
  const [swipedCards, setSwipedCards] = useState([]);
  const cardRef = useRef(null);

  const handleSwipe = (direction, card) => {
    console.log(`Swiped ${direction} on ${card.name}`);
    setSwipedCards((prev) => [...prev, card]);
    setCards((prevCards) => prevCards.filter((c) => c.zpid !== card.zpid));
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
      setSwipedCards((prev) => prev.slice(0, prev.length - 1));
      setCards((prev) => [...prev, lastCard]);
    }
  };

  const handleLiked = () => {
    console.log('Liked Homes button clicked!');
  };

  const handleDisliked = () => {
    console.log('Disliked Homes button clicked!');
  };

  return (
    <div className="App">
      <NavBar />
      <div className="contentContainer">
        <div className='editLocation'>
          <EditLocationIcon/>
          <h1>Las Cruces, NM</h1>
        </div>        
        <div className="mainContent">
          <div className="cardContainer">
          {cards.map((card, index) => {
          const isTopCard = index === cards.length - 1;
          const ref = isTopCard ? cardRef : null;
          return (
            <SwipeableCard
           key={card.zpid || index}
           ref={ref}
           card={card}
           onSwipe={handleSwipe}
           style={{ zIndex: index }}
         />
        );
      })}
          </div>
          <SwipeButtons onLike={handleLike} onDislike={handleDislike} />
        </div>
        <div className='footerBackground'>
          <div className="footerContainer">
            <button onClick={handlePrevious}><UndoIcon/></button>
            <button onClick={handleLiked}><StarsIcon/></button>
            <button onClick={handleDisliked}><NotInterestedIcon/></button>
          </div>  
        </div>
      </div>
    </div>
  );
}

export default SwipeFeatureComponent;