import { render, screen, fireEvent } from '@testing-library/react';
import SwipeButtons from '../SwipeButtons';

describe('SwipeButtons component', () => {
  test('calls onLike when the like button is clicked', () => {
    const onLike = vi.fn();
    const onDislike = vi.fn();
    render(<SwipeButtons onLike={onLike} onDislike={onDislike} />);
    
    // Assuming the second button corresponds to "like"
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onLike).toHaveBeenCalledTimes(1);
  });

  test('calls onDislike when the dislike button is clicked', () => {
    const onLike = vi.fn();
    const onDislike = vi.fn();
    render(<SwipeButtons onLike={onLike} onDislike={onDislike} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onDislike).toHaveBeenCalledTimes(1);
  });
});