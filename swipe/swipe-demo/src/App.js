// App.js
import React, { useState, useRef } from 'react';
import NavBar from './Components/Navbar';
import SwipeButtons from './Components/SwipeButtons';
import SwipeableCard from './Components/SwipeableCard';
import './App.css';
import cardsData from './cardData';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import UndoIcon from '@mui/icons-material/Undo';
import StarsIcon from '@mui/icons-material/Stars';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

function App() {
  const [cards, setCards] = useState(cardsData);
  const [swipedCards, setSwipedCards] = useState([]);
  const cardRef = useRef(null);

  const handleSwipe = (direction, card) => {
    console.log(`Swiped ${direction} on ${card.name}`);
    setSwipedCards((prev) => [...prev, card]);
    setCards((prevCards) => prevCards.filter((c) => c.name !== card.name));
  };

  const handleLike = () => {
    console.log('Like button clicked!');
    if (cardRef.current) {
      cardRef.current.swipe('right');
    }
  };

  const handleDislike = () => {
    console.log('Dislike button clicked!');
    if (cardRef.current) {
      cardRef.current.swipe('left');
    }
  };

  // Restore the last swiped card
  const handlePrevious = () => {
    if (swipedCards.length > 0) {
      const lastCard = swipedCards[swipedCards.length - 1];
      console.log(`Previous House clicked: restoring ${lastCard.name}`);
      setSwipedCards((prev) => prev.slice(0, prev.length - 1));
      setCards((prev) => [...prev, lastCard]);
    } else {
      console.log('No previous card to restore');
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

      {/* The main white container */}
      <div className="contentContainer">
          <div className='editLocation'>

            <EditLocationIcon/>
            <h1>Las Cruces, NM</h1>            
          </div>        
        {/* Main content area */}
        <div className="mainContent">


          <div className="cardContainer">
          
            {cards.map((card, index) => {
              const isTopCard = index === cards.length - 1;
              const ref = isTopCard ? cardRef : null;
              return (
                <SwipeableCard
                  key={card.name}
                  ref={ref}
                  card={card}
                  onSwipe={handleSwipe}
                />
              );
            })}
          </div>

          <SwipeButtons onLike={handleLike} onDislike={handleDislike} />
        </div>

        {/* Footer pinned at the bottom of the container */}
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

export default App;