// SwipeFeature.jsx
import React, { useState, useRef } from 'react';
import NavBar from './Navbar';
import SwipeButtons from './SwipeButtons';
import SwipeableCard from './SwipeableCard';
import './SwipeFeature.css';
import { useNavigate, useLocation } from 'react-router-dom';

import EditLocationIcon from '@mui/icons-material/EditLocation';
import UndoIcon from '@mui/icons-material/Undo';
import StarsIcon from '@mui/icons-material/Stars';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

function SwipeFeatureComponent() {
  const location = useLocation(); // ✅ useLocation moved inside the component
  const navigate = useNavigate();
  const listings = location.state?.listings || []; // ✅ you can use it here

  console.log('Listings from location.state:', listings);

  const cardsData = listings.length > 0 ? listings.map(home => ({
  name: `${home.addressStreet || 'Unknown'}`,  // Street address
  city: home.addressCity,
  state: home.addressState,
  zip: home.addressZipcode,
  img: home.imgSrc,
  price: home.unformattedPrice,
  bedrooms: home.beds,
  bathrooms: home.baths,
  area: home.area, 
  fullAddress: `${home.addressStreet}, ${home.addressCity}, ${home.addressState} ${home.addressZipcode}`,
  zpid: home.providerListingId || home.zpid || `${home.addressStreet}-${Math.random()}`
})) : [
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
      <div className='editLocation' onClick={() => navigate('/preferences')} style={{ cursor: 'pointer' }}>
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
          const ref = isTopCard ? cardRef : null;
          return (
          <SwipeableCard
           key={`${card.zpid}-${index}`}
           ref={index === cards.length - 1 ? cardRef : null}
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