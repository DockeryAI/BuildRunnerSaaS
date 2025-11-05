Here's a comprehensive set of unit tests for the OpenWeatherMap component:

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OpenWeatherMap } from './OpenWeatherMap'
import '@testing-library/jest-dom'

// Mock weather data
const mockWeatherData = {
  id: '1',
  location: 'Moab, UT',
  current: {
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 45,
    windSpeed: 8,
    visibility: 10,
    pressure: 30.15,
    feelsLike: 75,
    uvIndex: 6
  },
  forecast: [
    { date: 'Today', high: 78, low: 52, condition: 'Sunny', precipitation: 0 },
    { date: 'Tomorrow', high: 82, low: 55, condition: 'Partly Cloudy', precipitation: 10 }
  ],
  alerts: [
    {
      id: '1',
      title: 'High Wind Warning',
      description: 'Winds up to 45 mph expected',
      severity: 'moderate',
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T22:00:00Z'
    }
  ]
}

describe('OpenWeatherMap Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('renders loading state initially', () => {
    render(<OpenWeatherMap />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  test('displays weather data after loading', async () => {
    render(<OpenWeatherMap />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Moab, UT')).toBeInTheDocument()
    })

    // Check current weather display
    expect(screen.getByText('72°')).toBeInTheDocument()
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument()
  })

  test('displays weather alerts when present', async () => {
    render(<OpenWeatherMap />)
    
    await waitFor(() => {
      expect(screen.getByText('High Wind Warning')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Winds up to 45 mph expected')).toBeInTheDocument()
  })

  test('allows switching between forecast days', async () => {
    render(<OpenWeatherMap />)
    
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    // Click on tomorrow's forecast
    fireEvent.click(screen.getByText('Tomorrow'))
    
    // Check if tomorrow's details are displayed
    expect(screen.getByText('82°')).toBeInTheDocument()
  })

  test('displays correct weather icon based on condition', async () => {
    render(<OpenWeatherMap />)
    
    await waitFor(() => {
      const sunnyIcon = screen.getByTestId('weather-icon-sunny')
      expect(sunnyIcon).toBeInTheDocument()
    })
  })

  test('handles error state correctly', async () => {
    // Mock a failed API call
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'))
    
    render(<OpenWeatherMap />)
    
    await waitFor(() => {
      expect(screen.getByText('Weather Unavailable')).toBeInTheDocument()
    })
    
    // Check if retry button is present
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  test('calls onWeatherUpdate callback with weather data', async () => {
    const mockCallback = jest.fn()
    render(<OpenWeatherMap onWeatherUpdate={mockCallback} />)
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  test('updates weather data when location prop changes', async () => {
    const { rerender } = render(<OpenWeatherMap location="Moab, UT" />)
    
    await waitFor(() => {
      expect(screen.getByText('Moab, UT')).toBeInTheDocument()
    })

    // Rerender with new location
    rerender(<OpenWeatherMap location="Salt Lake City, UT" />)
    
    await waitFor(() => {
      expect(screen.getByText('Salt Lake City, UT')).toBeInTheDocument()
    })
  })

  test('displays trip planning insights correctly', async () => {
    render(<OpenWeatherMap />)
    
    await waitFor(() => {
      expect(screen.getByText('Trip Planning Insights')).toBeInTheDocument()
    })

    expect(screen.getByText('Temperature Range')).toBeInTheDocument()
    expect(screen.getByText('Precipitation Outlook')).toBeInTheDocument()
    expect(screen.getByText('Wind Conditions')).toBeInTheDocument()
  })

  test('displays correct units based on props', async () => {
    render(<OpenWeatherMap units="metric" />)
    
    await waitFor(() => {
      // Check if temperature is displayed in Celsius
      expect(screen.getByText(/°C/)).toBeInTheDocument()
    })
  })
})
To use these tests, you'll need to:

1. Install the required dependencies:bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
2. Add the following to your Jest configuration: