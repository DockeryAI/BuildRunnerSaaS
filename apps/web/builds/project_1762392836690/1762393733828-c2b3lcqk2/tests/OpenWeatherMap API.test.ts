Here's a comprehensive set of unit tests for the WeatherDisplay component:

import { render, screen, waitFor } from '@testing-library/react'
import { WeatherDisplay } from './WeatherDisplay'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

// Mock framer-motion to avoid animation-related issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('WeatherDisplay', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('shows loading state initially', () => {
    render(<WeatherDisplay />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('displays current weather information after loading', async () => {
    render(<WeatherDisplay />)

    // Wait for loading to complete
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('Current Weather')).toBeInTheDocument()
      expect(screen.getByText('72°')).toBeInTheDocument()
      expect(screen.getByText('8 mph')).toBeInTheDocument()
      expect(screen.getByText('Humidity: 45%')).toBeInTheDocument()
    })
  })

  it('displays 5-day forecast', async () => {
    render(<WeatherDisplay />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('5-Day Forecast')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(5)
    })
  })

  it('displays weather alerts when present', async () => {
    render(<WeatherDisplay />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('Weather Alerts')).toBeInTheDocument()
      expect(screen.getByText('Flash Flood Watch')).toBeInTheDocument()
      expect(screen.getByText('Heavy rainfall may cause flooding in low-lying areas')).toBeInTheDocument()
    })
  })

  it('displays correct weather icon based on conditions', async () => {
    render(<WeatherDisplay />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      // Test for different weather conditions
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument() // For 'Clear' conditions
      expect(screen.getByTestId('cloud-rain-icon')).toBeInTheDocument() // For 'Rain' conditions
      expect(screen.getByTestId('cloud-icon')).toBeInTheDocument() // For 'Cloudy' conditions
    })
  })

  it('handles errors appropriately', async () => {
    const mockError = new Error('API Error')
    const onError = jest.fn()

    // Mock the fetch to throw an error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError)

    render(<WeatherDisplay onError={onError} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch weather data')).toBeInTheDocument()
      expect(onError).toHaveBeenCalledWith(mockError)
    })
  })

  it('updates when props change', async () => {
    const { rerender } = render(<WeatherDisplay latitude={40.7128} longitude={-74.0060} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Rerender with different coordinates
    rerender(<WeatherDisplay latitude={51.5074} longitude={-0.1278} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Verify that the weather data was fetched again
    await waitFor(() => {
      expect(screen.getByText('Current Weather')).toBeInTheDocument()
    })
  })

  it('uses correct temperature units', async () => {
    const { rerender } = render(<WeatherDisplay units="imperial" />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('72°')).toBeInTheDocument()
    })

    // Rerender with metric units
    rerender(<WeatherDisplay units="metric" />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      // Assuming the temperature conversion is implemented
      expect(screen.getByText('22°')).toBeInTheDocument()
    })
  })
})
You'll also need to add some data-testid attributes to your component to make the tests work:

// In your WeatherDisplay component:

// Add to loading state
<motion.div 
  data-testid="loading-skeleton"
  className="animate-pulse bg-muted rounded-lg p-6"
  ...
>

// Add to weather icons
const getWeatherIcon = (conditions: string) => {
  switch(conditions.toLowerCase()) {
    case 'rain':
      return <CloudRain data-testid="cloud-rain-icon" className="w-6 h-6" />
    case 'cloudy':
    case 'partly cloudy':
      return <Cloud data-testid="cloud-icon" className="w-6 h-6" />
    default:
      return <Sun data-testid="sun-icon" className="w-6 h-6" />
  }
}

// Add role="listitem" to daily forecast items
<motion.div
  role="listitem"
  key={day.date}
  ...
>
This test suite covers:

1. Initial loading state
2. Display of current weather information
3. Display of 5-day forecast
4. Weather alerts rendering
5. Weather icon rendering based on conditions
6. Error handling
7. Component updates when props change
8. Temperature unit conversion
9. Loading states and transitions

Make sure to install the necessary dependencies:
bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
And add the following to your Jest setup file:

import '@testing-library/jest-dom'
This will give you comprehensive test coverage for the WeatherDisplay component.