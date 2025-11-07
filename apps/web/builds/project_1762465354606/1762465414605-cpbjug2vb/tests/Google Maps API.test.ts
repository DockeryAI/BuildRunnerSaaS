Here's a comprehensive set of unit tests for the Google Maps component:

// GoogleMapService.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleMapService } from './GoogleMapService';
import '@testing-library/jest-dom';

// Mock the google maps script loading
const mockGeocoder = {
  geocode: jest.fn(),
};

const mockAutocompleteService = {
  getPlacePredictions: jest.fn(),
};

const mockPlacesService = {
  getDetails: jest.fn(),
};

const mockMap = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  addListener: jest.fn(),
};

const mockMarker = {
  setPosition: jest.fn(),
  addListener: jest.fn(),
};

// Mock the google maps global object
const mockGoogle = {
  maps: {
    Map: jest.fn(() => mockMap),
    Marker: jest.fn(() => mockMarker),
    Geocoder: jest.fn(() => mockGeocoder),
    places: {
      AutocompleteService: jest.fn(() => mockAutocompleteService),
      PlacesService: jest.fn(() => mockPlacesService),
    },
  },
};

beforeAll(() => {
  // @ts-ignore
  global.google = mockGoogle;
  global.window.google = mockGoogle;
});

describe('GoogleMapService', () => {
  const defaultProps = {
    apiKey: 'test-api-key',
    defaultCenter: { lat: 34.052235, lng: -118.243683, address: 'Los Angeles, CA' },
    onLocationSelect: jest.fn(),
    searchPlaceholder: 'Search location...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<GoogleMapService {...defaultProps} />);
    expect(screen.getByText('Loading Map...')).toBeInTheDocument();
  });

  it('renders the map container after loading', async () => {
    render(<GoogleMapService {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole('application')).toBeInTheDocument();
    });
  });

  it('handles search input changes', async () => {
    render(<GoogleMapService {...defaultProps} />);
    
    const searchInput = await screen.findByRole('textbox');
    await userEvent.type(searchInput, 'New York');

    expect(mockAutocompleteService.getPlacePredictions).toHaveBeenCalledWith({
      input: 'New York',
    });
  });

  it('displays search suggestions', async () => {
    const mockPredictions = [
      { place_id: '1', description: 'New York, NY' },
      { place_id: '2', description: 'New York City, NY' },
    ];

    mockAutocompleteService.getPlacePredictions.mockImplementationOnce((_, callback) => {
      callback({ predictions: mockPredictions }, 'OK');
    });

    render(<GoogleMapService {...defaultProps} />);
    
    const searchInput = await screen.findByRole('textbox');
    await userEvent.type(searchInput, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York, NY')).toBeInTheDocument();
      expect(screen.getByText('New York City, NY')).toBeInTheDocument();
    });
  });

  it('handles location selection from suggestions', async () => {
    const mockPlace = {
      geometry: {
        location: {
          lat: () => 40.7128,
          lng: () => -74.0060,
        },
      },
      formatted_address: 'New York, NY',
    };

    mockPlacesService.getDetails.mockImplementationOnce((request, callback) => {
      callback(mockPlace, 'OK');
    });

    render(<GoogleMapService {...defaultProps} />);
    
    // Simulate selecting a suggestion
    const suggestion = await screen.findByText('New York, NY');
    await userEvent.click(suggestion);

    expect(mockMap.setCenter).toHaveBeenCalled();
    expect(mockMarker.setPosition).toHaveBeenCalled();
    expect(defaultProps.onLocationSelect).toHaveBeenCalled();
  });

  it('handles geolocation request', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) => 
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        })
      ),
    };
    
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;

    render(<GoogleMapService {...defaultProps} />);
    
    const locateButton = await screen.findByLabelText('Locate me');
    await userEvent.click(locateButton);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(mockMap.setCenter).toHaveBeenCalled();
    expect(mockMarker.setPosition).toHaveBeenCalled();
  });

  it('handles geolocation errors', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success, error) => 
        error(new Error('Geolocation error'))
      ),
    };
    
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;

    render(<GoogleMapService {...defaultProps} />);
    
    const locateButton = await screen.findByLabelText('Locate me');
    await userEvent.click(locateButton);

    await waitFor(() => {
      expect(screen.getByText(/Could not retrieve your current location/i)).toBeInTheDocument();
    });
  });

  it('handles search clear button', async () => {
    render(<GoogleMapService {...defaultProps} />);
    
    const searchInput = await screen.findByRole('textbox');
    await userEvent.type(searchInput, 'New York');
    
    const clearButton = await screen.findByLabelText('Clear search');
    await userEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('displays error state when Google Maps fails to load', async () => {
    // Simulate Google Maps script loading error
    const errorMessage = 'Failed to load Google Maps script';
    render(<GoogleMapService {...defaultProps} />);
    
    // Trigger the error
    const script = document.querySelector('script');
    if (script) {
      fireEvent.error(script);
    }

    await waitFor(() => {
      expect(screen.getByText(/Map Error/i)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });
});
This test suite covers:

1. Initial loading state
2. Map container rendering
3. Search functionality
4. Autocomplete suggestions
5. Location selection
6. Geolocation features
7. Error handling
8. Search clearing
9. Map loading failures

Additional considerations:

1. Add `jest.config.js`:
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
2. Install necessary dependencies:bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest ts-jest @types/jest identity-obj-proxy
3. Add test scripts to `package.json`: