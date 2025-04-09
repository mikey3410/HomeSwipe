import { render } from '@testing-library/react';
import NavBar from '../Navbar';

describe('NavBar component', () => {
  test('renders a div with height 60px', () => {
    const { container } = render(<NavBar />);
    const div = container.firstChild;
    expect(div).toBeInTheDocument();
    expect(div).toHaveStyle({ height: '60px' });
  });
});