/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// --- Mock Material UI Icons ---
vi.mock('@mui/icons-material/EditLocation', () => ({
  default: () => <div data-testid="EditLocationIcon" />,
}));
vi.mock('@mui/icons-material/Undo', () => ({
  default: () => <div data-testid="UndoIcon" />,
}));
vi.mock('@mui/icons-material/Stars', () => ({
  default: () => <div data-testid="StarsIcon" />,
}));
vi.mock('@mui/icons-material/NotInterested', () => ({
  default: () => <div data-testid="NotInterestedIcon" />,
}));

// --- Global Firebase Auth Mock ---
vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'testUser' },
  }),
}));

// A fake listing used in tests.
const fakeListing = {
  addressStreet: '123 Main St',
  addressCity: 'Los Angeles',
  addressState: 'CA',
  addressZipcode: '90001',
  imgSrc: 'http://example.com/image.jpg',
  unformattedPrice: 500000,
  beds: 3,
  baths: 2,
  area: 1500,
  providerListingId: 'home1',
};

let SwipeFeatureComponent;

// --- Listings and Display Tests (no override needed) ---
describe('SwipeFeatureComponent - Listings and Display', () => {
  beforeAll(async () => {
    const module = await import('../SwipeFeature.jsx');
    SwipeFeatureComponent = module.default;
  });

  it('renders location info when a listing is provided', async () => {
    // Use MemoryRouter imported statically (okay for this block)
    const { MemoryRouter } = await import('react-router-dom');
    render(
      <MemoryRouter initialEntries={[{ pathname: '/swipe', state: { listings: [fakeListing] } }]}>
        <SwipeFeatureComponent />
      </MemoryRouter>
    );

    // Expect the header to display "Los Angeles, CA"
    const header = await screen.findByText(/Los Angeles, CA/i);
    expect(header).toBeInTheDocument();
  });

  it('renders default "Your Area" text when no listing is provided', async () => {
    const { MemoryRouter } = await import('react-router-dom');
    render(
      <MemoryRouter initialEntries={[{ pathname: '/swipe', state: {} }]}>
        <SwipeFeatureComponent />
      </MemoryRouter>
    );

    // Expect the header to show "Your Area"
    const header = await screen.findByText("Your Area");
    expect(header).toBeInTheDocument();
  });
});

// --- Navigation Tests with Dynamic Imports ---
describe('SwipeFeatureComponent - Navigation', () => {
  let MemoryRouter, mockNavigate;

  beforeEach(async () => {
    // Reset modules to ensure no previous imports affect our mocks.
    await vi.resetModules();

    // Dynamically import react-router-dom so that our mocks take effect.
    const reactRouterDom = await import('react-router-dom');
    MemoryRouter = reactRouterDom.MemoryRouter;

    // Set up our mock navigation function.
    mockNavigate = vi.fn();

    // Override the useNavigate hook.
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls navigate to /preferences when edit location area is clicked', async () => {
    // Import the component after our mocks are in place.
    const { default: Component } = await import('../SwipeFeature.jsx');

    render(
      <MemoryRouter initialEntries={[{ pathname: '/swipe', state: { listings: [fakeListing] } }]}>
        <Component />
      </MemoryRouter>
    );

    // Query the clickable element using the data-testid.
    const editLocationElem = await screen.findByTestId('edit-location');
    expect(editLocationElem).toBeInTheDocument();

    // Simulate a click on the edit location element.
    fireEvent.click(editLocationElem);

    // Verify that mockNavigate was called with '/preferences'
    expect(mockNavigate).toHaveBeenCalledWith('/preferences');
  });
});