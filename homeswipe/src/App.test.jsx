import { render, screen } from '@testing-library/react';
import App from './App';

test('renders HomeSwipe text', () => {
  render(<App />);
  const headerElements = screen.getAllByText(/HomeSwipe/i);
  expect(headerElements.length).toBeGreaterThan(0);
});