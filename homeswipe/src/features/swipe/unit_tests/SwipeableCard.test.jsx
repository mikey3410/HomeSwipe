import { render, screen } from '@testing-library/react';
import SwipeableCard from '../SwipeableCard';
import React from 'react';

describe('SwipeableCard component', () => {
  const card = {
    name: 'Test Home',
    img: 'test-image.jpg',
    price: 250000,
    bedrooms: 3,
    bathrooms: 2,
  };

  test('renders with correct background image and price overlay', () => {
    const onSwipe = vi.fn();
    const { container } = render(<SwipeableCard card={card} onSwipe={onSwipe} />);
    
    // Check that the card element is rendered (it has the class "card")
    const cardElement = container.querySelector('.card');
    expect(cardElement).toBeInTheDocument();
    
    // Verify that the backgroundImage style contains the correct image URL
    expect(cardElement.style.backgroundImage).toContain(`url(${card.img})`);
    
    // Verify that the overlay displays the formatted price "$250,000"
    const priceText = screen.getByText(/\$250,000/i);
    expect(priceText).toBeInTheDocument();
  });
});