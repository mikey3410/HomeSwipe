// ImageCarousel.jsx
import React from 'react';
import './ImageCarousel.css';

const ImageCarousel = ({ card, onNextImage, onPrevImage }) => {
  // Convert images to array if it's not already one
  const images = Array.isArray(card.images) ? card.images : [card.images];
  
  return (
    <div className="carousel-container">
      {images.map((imageUrl, index) => (
        <img
          key={index}
          src={typeof imageUrl === 'string' ? imageUrl : imageUrl?.url || ''}
          alt={`Property ${index + 1}`}
          className={`carousel-image ${
            index === card.currentImageIndex ? 'active' : ''
          }`}
        />
      ))}
      <button 
        className="carousel-button prev" 
        onClick={(e) => {
          e.stopPropagation();
          onPrevImage(card.zpid, card.currentImageIndex);
        }}
        aria-label="Previous image"
      ></button>
      <button 
        className="carousel-button next" 
        onClick={(e) => {
          e.stopPropagation();
          onNextImage(card.zpid, card.currentImageIndex);
        }}
        aria-label="Next image"
      ></button>
      
      {/* Image Counter */}
      <div className="image-counter">
        {images.length > 0
          ? `${card.currentImageIndex + 1} / ${images.length}`
          : 'No images'}
      </div>
    </div>
  );
};

export default ImageCarousel;