import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { fetchListings } from './../../api/zillowbase.js'; // Adjust the import path as necessary
import NavBar from './Navbar';
import SwipeButtons from './SwipeButtons';
import SwipeableCard from './SwipeableCard';
import './SwipeFeature.css';
import { motion } from 'framer-motion';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config"; //  just two levels up

import EditLocationIcon from '@mui/icons-material/EditLocation';
import UndoIcon from '@mui/icons-material/Undo';
import StarsIcon from '@mui/icons-material/Stars';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

const fetchSwipedHomes = async (userId, action) => {
  const q = query(
    collection(db, "swipes"),
    where("userId", "==", userId),
    where("action", "==", action)
  );

  const snapshot = await getDocs(q);
  const swipes = snapshot.docs.map(doc => doc.data().homeId);
  return swipes;
};

function SwipeFeatureComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [swipedCards, setSwipedCards] = useState([]);
  const cardRef = useRef(null);
  const motionY = useMotionValue(300);
  const translateY = useTransform(motionY, y => `translateY(${y}px)`);

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

      if (!listings) {
        const preferences = {
          city: location.state?.city || 'Las Cruces',
          state: location.state?.state || 'NM',
          minPrice: location.state?.minPrice || '',
          maxPrice: location.state?.maxPrice || '',
          bedrooms: location.state?.bedrooms || '',
          bathrooms: location.state?.bathrooms || '',
        };
        listings = await fetchListings(preferences);
        sessionStorage.setItem('listings', JSON.stringify(listings));
      }

      // If listings exist, transform them into card format
      if (listings && listings.length > 0) {
        const transformed = listings.map(home => {
          const images = Array.isArray(home.carouselPhotos) && home.carouselPhotos.length > 0
            ? home.carouselPhotos.map(photo => photo.url)
            : home.imgSrc;

          return {
            name: home.addressStreet || 'Unknown',
            city: home.addressCity || '',
            state: home.addressState || '',
            zip: home.addressZipcode || '',
            images,
            currentImageIndex: 0,
            price: home.unformattedPrice || 0,
            bedrooms: home.beds || 0,
            bathrooms: home.baths || 0,
            area: home.area || 0,
            zpid: home.providerListingId || home.zpid || `${home.addressStreet || 'unknown'}-${Math.random()}`,

             //  Extra fields for detail panel
            lotAreaValue: home.hdpData?.homeInfo?.lotAreaValue || null,
            lotAreaUnit: home.hdpData?.homeInfo?.lotAreaUnit || null,
            daysOnZillow: home.hdpData?.homeInfo?.daysOnZillow ?? null,
            brokerName: home.brokerName || null,
            latitude: home.latitude,
            longitude: home.longitude,
            yearBuilt: home.hdpData?.homeInfo?.yearBuilt || null,
            homeType: home.hdpData?.homeInfo?.homeType || null,
            listingSubType: home.hdpData?.homeInfo?.listing_sub_type || null,
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

  // swipe up feature expander
  const [expandedCard, setExpandedCard] = useState(null);

  const handleExpand = (card) => {
    setExpandedCard(card);
    animate(motionY, 0, { duration: 0.4 });
  };

  const closeExpanded = () => {
    animate(motionY, 300, { duration: 0.4 }).then(() => {
      setExpandedCard(null);
      motionY.set(300); // Reset for next time
    });
  };

  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);

  const calculateMonthlyMortgage = (price) => {
    const principal = price * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
  };

  const monthlyPayment = expandedCard
    ? calculateMonthlyMortgage(expandedCard.unformattedPrice || expandedCard.price || 0).toFixed(2)
    : '0.00';

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

  const handlePrevious = () => {
    if (swipedCards.length > 0) {
      const lastCard = swipedCards[swipedCards.length - 1];
      setSwipedCards(prev => prev.slice(0, prev.length - 1));
      setCards(prev => [...prev, lastCard]);
    }
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

  const goToLikedHomes = async () => {
    const likedHomes = await fetchSwipedHomes(currentUserId, 'like');
    navigate('/liked', { state: { homes: likedHomes } });
  };
  
  const goToDislikedHomes = async () => {
    const dislikedHomes = await fetchSwipedHomes(currentUserId, 'dislike');
    navigate('/disliked', { state: { homes: dislikedHomes } });
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
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate('/preferences')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full shadow hover:bg-gray-100 transition"
          >
            <EditLocationIcon />
            <span className="text-sm text-gray-700">
              {cards.length > 0 && cards[0].city && cards[0].state
                ? `${cards[0].city}, ${cards[0].state}`
                : "Your Area"}
            </span>
            <span className="text-blue-600 underline text-sm">Change Location</span>
          </button>
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
                  onExpand={handleExpand}
                  motionY = {motionY}
                  style={{ zIndex: cards.length - index }}
                  animationDirection={card.animationDirection || 0} // Pass direction, default 0
                />
              );
            })}
          </div>
          <div style={{ position: 'relative', zIndex: 100 }}>
            <SwipeButtons onLike={handleLike} onDislike={handleDislike} />
          </div>
        </div>

        <div className="footerBackground" style={{ position: 'relative', zIndex: 100, backgroundColor: 'white' }}>
          <div className="footerContainer">
            <button onClick={handlePrevious}>
              <UndoIcon />
            </button>
            <button onClick={goToLikedHomes}>
              <StarsIcon />
            </button>
            <button onClick={goToDislikedHomes}>
              <NotInterestedIcon />
            </button>
          </div>
        </div>
      </div>

      {expandedCard && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 max-h-[60vh] overflow-y-auto z-[1000] p-6 bg-white/80 backdrop-blur-md rounded-t-3xl shadow-2xl font-sans"
          style={{ transform: translateY }}
        >
          <div className="text-right mb-2">
            <button
              onClick={closeExpanded}
              className="text-xl bg-transparent border-none cursor-pointer"
              aria-label="Close"
            >
              ✖️
            </button>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">
              {expandedCard.unformattedPrice
                ? `$${Number(expandedCard.unformattedPrice).toLocaleString()}`
                : expandedCard.price
                ? `$${Number(
                    String(expandedCard.price).replace(/[^0-9.-]+/g, '')
                  ).toLocaleString()}`
                : 'Price not available'}
            </h2>
            <p className="text-gray-700 text-sm">{expandedCard.fullAddress}</p>
          </div>

          <hr className="my-4 border-t border-gray-300" />

    {/* Property Details */}
    <div className="text-center space-y-1">
      <h3 className="text-lg font-semibold">🏠 Property Details</h3>
      <div className="flex justify-center flex-wrap gap-6 text-sm mt-2">
        <div>{expandedCard.bedrooms ?? 'N/A'} Beds</div>
        <div>{expandedCard.bathrooms ?? 'N/A'} Baths</div>
        <div> {expandedCard.area || 'N/A'} sqft</div>
        {expandedCard.lotAreaValue && (
          <div> Lot: {expandedCard.lotAreaValue} {expandedCard.lotAreaUnit}</div>
        )}
        {expandedCard.homeType && (
          <div> Type: {expandedCard.homeType}</div>
        )}
        {expandedCard.listingSubType && (
          <div>
             Listing:
            {expandedCard.listingSubType.is_FSBA && ' For Sale by Agent'}
            {expandedCard.listingSubType.is_newHome && ' • New Construction'}
            {expandedCard.listingSubType.is_openHouse && ' • Open House'}
          </div>
        )}
      </div>
    </div>

          <hr className="my-4 border-t border-gray-300" />

    {/* Listing Info */}
    <div className="text-center space-y-1">
      <h3 className="text-lg font-semibold">Listing Info</h3>
      {expandedCard.daysOnZillow != null && (
        <p className="text-sm">Days on Market: {expandedCard.daysOnZillow}</p>
      )}
      {expandedCard.brokerName && (
        <p className="text-sm"> Broker: {expandedCard.brokerName}</p>
      )}
    </div>

          <hr className="my-4 border-t border-gray-300" />

    {/* Mortgage Calculator */}
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold"> Estimated Mortgage</h3>
      <p className="mb-2 text-lg font-medium text-green-700">
        📆 ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}/month (est.)
      </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm mt-2">
              <label className="flex items-center gap-2">
                Down Payment (%):
                <input
                  type="number"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-20 text-center"
                />
              </label>
              <label className="flex items-center gap-2">
                Interest Rate (%):
                <input
                  type="number"
                  value={interestRate}
                  step="0.1"
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-20 text-center"
                />
              </label>
              <label className="flex items-center gap-2">
                Loan Term (years):
                <input
                  type="number"
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-20 text-center"
                />
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default SwipeFeatureComponent;