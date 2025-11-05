Here's a comprehensive set of unit tests for the OpenWeatherMap component:

// OpenWeatherMap.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { OpenWeatherMap } from './OpenWeatherMap'
import '@testing-library/jest-dom'

describe('OpenWeatherMap Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders loading state initially', () => {
    render(<OpenWeatherMap />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('displays weather data after loading', async () => {
    render(<OpenWeatherMap location="Moab, UT" />)

    // Wait for mock API call
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('Moab, UT')).toBeInTheDocument()
      expect(screen.getByText('72°F')).toBeInTheDocument()
      expect(screen.getByText('Partly Cloudy')).toBeInTheDocument()
    })
  })

  it('handles error state correctly', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock failed API call
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'))

    render(<OpenWeatherMap />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('Weather Unavailable')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('calls onWeatherUpdate callback with weather data', async () => {
    const mockOnWeatherUpdate = jest.fn()
    render(<OpenWeatherMap onWeatherUpdate={mockOnWeatherUpdate} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(mockOnWeatherUpdate).toHaveBeenCalledTimes(1)
      expect(mockOnWeatherUpdate).toHaveBeenCalledWith(expect.objectContaining({
        location: 'Moab, UT',
        current: expect.any(Object)
      }))
    })
  })

  it('shows/hides forecast based on showForecast prop', async () => {
    const { rerender } = render(<OpenWeatherMap showForecast={false} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.queryByText('7-Day Forecast')).not.toBeInTheDocument()
    })

    rerender(<OpenWeatherMap showForecast={true} />)

    await waitFor(() => {
      expect(screen.getByText('7-Day Forecast')).toBeInTheDocument()
    })
  })

  it('shows/hides alerts based on showAlerts prop', async () => {
    const { rerender } = render(<OpenWeatherMap showAlerts={false} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.queryByText('Flash Flood Watch')).not.toBeInTheDocument()
    })

    rerender(<OpenWeatherMap showAlerts={true} />)

    await waitFor(() => {
      expect(screen.getByText('Flash Flood Watch')).toBeInTheDocument()
    })
  })

  it('refreshes weather data when refresh button is clicked', async () => {
    render(<OpenWeatherMap />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh weather data/i })
      fireEvent.click(refreshButton)
    })

    expect(screen.getByRole('button', { name: /refresh weather data/i })).toHaveAttribute('disabled')

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh weather data/i })).not.toHaveAttribute('disabled')
    })
  })

  it('displays correct weather icons', async () => {
    render(<OpenWeatherMap />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      const weatherIcons = screen.getAllByTestId('weather-icon')
      expect(weatherIcons.length).toBeGreaterThan(0)
      expect(weatherIcons[0]).toHaveClass('text-gray-500') // For partly-cloudy icon
    })
  })

  it('displays correct severity colors for alerts', async () => {
    render(<OpenWeatherMap showAlerts={true} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-orange-100') // For moderate severity
    })
  })

  it('updates when location prop changes', async () => {
    const { rerender } = render(<OpenWeatherMap location="Moab, UT" />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('Moab, UT')).toBeInTheDocument()
    })

    rerender(<OpenWeatherMap location="Sedona, AZ" />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText('Sedona, AZ')).toBeInTheDocument()
    })
  })
})
To make these tests work, you'll need to add some data-testid attributes to your component:

// Add to loading skeleton
<div data-testid="loading-skeleton" className="animate-pulse space-y-4">

// Add to weather icons
{getWeatherIcon(weather.current.icon, 'weather-icon')}

// Modify getWeatherIcon function to accept testId
const getWeatherIcon = (iconType: string, testId?: string) => {
  const props = {
    className: "w-8 h-8",
    "data-testid": testId
  }
  
  switch (iconType) {
    // ... rest of the cases
  }
}
These tests cover:
1. Initial loading state
2. Successful data loading
3. Error handling
4. Callback functionality
5. Conditional rendering of forecasts and alerts
6. Refresh functionality
7. Weather icon display
8. Alert severity styling
9. Location updates
10. Component props and state management

You'll need these dependencies in your package.json: