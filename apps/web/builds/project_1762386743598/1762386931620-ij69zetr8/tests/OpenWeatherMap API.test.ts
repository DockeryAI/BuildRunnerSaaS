Here's a comprehensive set of unit tests for the WeatherService component:

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeatherService } from './WeatherService'

describe('WeatherService Component', () => {
  // Mock default props
  const defaultProps = {
    location: 'Moab, UT',
    coordinates: { lat: 38.5733, lon: -109.5498 },
    onLocationSelect: jest.fn(),
    showAlerts: true,
    showForecast: true,
    apiKey: 'test_key'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders loading state initially', () => {
    render(<WeatherService {...defaultProps} />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  test('renders weather data after loading', async () => {
    render(<WeatherService {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Weather Conditions')).toBeInTheDocument()
      expect(screen.getByText('Moab, UT')).toBeInTheDocument()
    })
  })

  test('handles location search', async () => {
    render(<WeatherService {...defaultProps} />)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search location...')
      const searchButton = screen.getByText('Search')
      
      fireEvent.change(searchInput, { target: { value: 'Denver' } })
      fireEvent.click(searchButton)
    })

    await waitFor(() => {
      expect(defaultProps.onLocationSelect).toHaveBeenCalledWith(
        'Denver',
        expect.objectContaining({ lat: expect.any(Number), lon: expect.any(Number) })
      )
    })
  })

  test('displays weather alerts when present', async () => {
    render(<WeatherService {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('High Wind Warning')).toBeInTheDocument()
    })
  })

  test('hides alerts when showAlerts is false', async () => {
    render(<WeatherService {...defaultProps} showAlerts={false} />)
    
    await waitFor(() => {
      expect(screen.queryByText('High Wind Warning')).not.toBeInTheDocument()
    })
  })

  test('displays 7-day forecast when showForecast is true', async () => {
    render(<WeatherService {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('7-Day Forecast')).toBeInTheDocument()
      expect(screen.getAllByText(/°F/).length).toBeGreaterThan(0)
    })
  })

  test('hides forecast when showForecast is false', async () => {
    render(<WeatherService {...defaultProps} showForecast={false} />)
    
    await waitFor(() => {
      expect(screen.queryByText('7-Day Forecast')).not.toBeInTheDocument()
    })
  })

  test('displays error state when fetch fails', async () => {
    // Mock failed API call
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'))
    
    render(<WeatherService {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Weather Unavailable')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  test('handles retry button click in error state', async () => {
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload }
    })

    render(<WeatherService {...defaultProps} />)
    
    await waitFor(() => {
      const retryButton = screen.getByText('Try Again')
      fireEvent.click(retryButton)
      expect(mockReload).toHaveBeenCalled()
    })
  })

  test('displays current conditions correctly', async () => {
    render(<WeatherService {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('72°F')).toBeInTheDocument()
      expect(screen.getByText('Feels like 75°F')).toBeInTheDocument()
      expect(screen.getByText('8 mph')).toBeInTheDocument()
      expect(screen.getByText('45%')).toBeInTheDocument()
    })
  })

  test('updates search location input correctly', async () => {
    render(<WeatherService {...defaultProps} />)
    
    const searchInput = await screen.findByPlaceholderText('Search location...')
    await userEvent.type(searchInput, 'New York')
    
    expect(searchInput).toHaveValue('New York')
  })

  test('handles Enter key press in search input', async () => {
    render(<WeatherService {...defaultProps} />)
    
    const searchInput = await screen.findByPlaceholderText('Search location...')
    await userEvent.type(searchInput, 'Chicago{enter}')
    
    await waitFor(() => {
      expect(defaultProps.onLocationSelect).toHaveBeenCalled()
    })
  })
})
Additional test setup files needed:

// jest.setup.js
import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
}
These tests cover:

1. Initial loading state
2. Data rendering after loading
3. Location search functionality
4. Weather alerts display
5. Forecast display
6. Error handling
7. Current conditions display
8. User interactions
9. Component props behavior
10. Search input functionality

The tests use both `fireEvent` and `userEvent` for different types of interactions and include proper async handling with `waitFor`. They also mock necessary browser APIs and handle both success and error scenarios.

Remember to:
- Install required dependencies (@testing-library/react, @testing-library/jest-dom, @testing-library/user-event)
- Configure Jest properly for React and TypeScript
- Add data-testid attributes to loading states if needed
- Mock fetch calls appropriately in a real implementation