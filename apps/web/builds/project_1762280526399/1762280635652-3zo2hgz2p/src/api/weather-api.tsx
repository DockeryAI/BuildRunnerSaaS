'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Thermometer, Droplets, Eye, AlertTriangle } from 'lucide-react'

interface WeatherData {
  id: string
  location: string
  current: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
    visibility: number
    feelsLike: number
    icon: string
  }
  forecast: Array<{
    date: string
    high: number
    low: number
    condition: string
    precipitation: number
    icon: string
  }>
  alerts: Array<{
    id: string
    title: string
    description: string
    severity: 'low' | 'moderate' | 'high' | 'extreme'
    expires: string
  }>
}

interface WeatherAPIProps {
  location?: string
  onLocationChange?: (location: string) => void
  showForecast?: boolean
  showAlerts?: boolean
}

export function WeatherAPI({
  location = 'Moab, UT',
  onLocationChange = () => {},
  showForecast = true,
  showAlerts = true
}: WeatherAPIProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState(location)

  useEffect(() => {
    fetchWeatherData(location)
  }, [location])

  const fetchWeatherData = async (loc: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call - replace with actual weather API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: WeatherData = {
        id: '1',
        location: loc,
        current: {
          temperature: 72,
          condition: 'Partly Cloudy',
          humidity: 45,
          windSpeed: 8,
          visibility: 10,
          feelsLike: 75,
          icon: 'partly-cloudy'
        },
        forecast: [
          { date: '2024-01-15', high: 75, low: 45, condition: 'Sunny', precipitation: 0, icon: 'sunny' },
          { date: '2024-01-16', high: 68, low: 42, condition: 'Cloudy', precipitation: 10, icon: 'cloudy' },
          { date: '2024-01-17', high: 62, low: 38, condition: 'Rain', precipitation: 80, icon: 'rainy' },
          { date: '2024-01-18', high: 58, low: 35, condition: 'Snow', precipitation: 90, icon: 'snowy' },
          { date: '2024-01-19', high: 65, low: 40, condition: 'Partly Cloudy', precipitation: 20, icon: 'partly-cloudy' },
          { date: '2024-01-20', high: 70, low: 45, condition: 'Sunny', precipitation: 0, icon: 'sunny' },
          { date: '2024-01-21', high: 73, low: 48, condition: 'Sunny', precipitation: 5, icon: 'sunny' }
        ],
        alerts: [
          {
            id: '1',
            title: 'High Wind Warning',
            description: 'Winds up to 45 mph expected. Secure loose objects.',
            severity: 'moderate',
            expires: '2024-01-15T18:00:00Z'
          }
        ]
      }
      
      setWeatherData(mockData)
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = () => {
    if (searchLocation.trim()) {
      onLocationChange(searchLocation)
      fetchWeatherData(searchLocation)
    }
  }

  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />
      case 'partly-cloudy':
        return <Cloud className="w-8 h-8 text-gray-400" />
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-[rgb(34, 139, 34)]" />
      case 'snowy':
        return <CloudSnow className="w-8 h-8 text-blue-300" />
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'extreme':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-[rgb(241, 245, 249)] text-gray-800 border-[rgb(226, 232, 240)]'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[rgb(241,245,249)] rounded w-1/3"></div>
            <div className="h-24 bg-[rgb(241,245,249)] rounded"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-[rgb(241,245,249)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-[rgb(239,68,68)] mx-auto" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Weather Data Unavailable</h3>
            <p className="text-[rgb(100,116,139)]">{error}</p>
            <button
              onClick={() => fetchWeatherData(location)}
              className="px-6 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,52)] transition-colors font-medium"
              aria-label="Retry fetching weather data"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-medium">
      {/* Location Search */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
            placeholder="Enter location (e.g., Moab, UT)"
            className="flex-1 px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent text-[rgb(15,23,42)]"
            aria-label="Search location"
          />
          <button
            onClick={handleLocationSearch}
            className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,52)] transition-colors font-medium min-h-[44px]"
            aria-label="Search weather for location"
          >
            Get Weather
          </button>
        </div>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[rgb(15,23,42)]">Current Weather</h2>
          <span className="text-[rgb(100,116,139)]">{weatherData.location}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weatherData.current.icon)}
            <div>
              <div className="text-4xl font-bold text-[rgb(15,23,42)]">
                {weatherData.current.temperature}°F
              </div>
              <div className="text-[rgb(100,116,139)]">{weatherData.current.condition}</div>
              <div className="text-sm text-[rgb(100,116,139)]">
                Feels like {weatherData.current.feelsLike}°F
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-[rgb(34, 139, 34)]" />
              <div>
                <div className="text-sm text-[rgb(100,116,139)]">Humidity</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-[rgb(100,116,139)]">Wind</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.windSpeed} mph</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-[rgb(100,116,139)]">Visibility</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.visibility} mi</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-sm text-[rgb(100,116,139)]">Feels Like</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.feelsLike}°F</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {showAlerts && weatherData.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h3 className="text-xl font-semibold text-[rgb(15,23,42)] mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-[rgb(245,158,11)]" />
            Weather Alerts
          </h3>
          <div className="space-y-3">
            {weatherData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                role="alert"
                aria-live="polite"
              >
                <div className="font-semibold mb-1">{alert.title}</div>
                <div className="text-sm mb-2">{alert.description}</div>
                <div className="text-xs opacity-75">
                  Expires: {new Date(alert.expires).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      {showForecast && (
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h3 className="text-xl font-semibold text-[rgb(15,23,42)] mb-4">7-Day Forecast</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {weatherData.forecast.map((day, index) => (
              <div
                key={day.date}
                className="text-center p-4 rounded-lg bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] transition-colors"
              >
                <div className="text-sm font-semibold text-[rgb(15,23,42)] mb-2">
                  {index === 0 ? 'Today' : formatDate(day.date)}
                </div>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.icon)}
                </div>
                <div className="text-sm text-[rgb(100,116,139)] mb-1">{day.condition}</div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[rgb(15,23,42)]">{day.high}°</span>
                  <span className="text-[rgb(100,116,139)]">{day.low}°</span>
                </div>
                {day.precipitation > 0 && (
                  <div className="text-xs text-[rgb(34, 139, 34)] mt-1">
                    {day.precipitation}% rain
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data for demo
const DEFAULT_WEATHER_DATA: WeatherData = {
  id: '1',
  location: 'Moab, UT',
  current: {
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 45,
    windSpeed: 8,
    visibility: 10,
    feelsLike: 75,
    icon: 'partly-cloudy'
  },
  forecast: [
    { date: '2024-01-15', high: 75, low: 45, condition: 'Sunny', precipitation: 0, icon: 'sunny' },
    { date: '2024-01-16', high: 68, low: 42, condition: 'Cloudy', precipitation: 10, icon: 'cloudy' },
    { date: '2024-01-17', high: 62, low: 38, condition: 'Rain', precipitation: 80, icon: 'rainy' },
    { date: '2024-01-18', high: 58, low: 35, condition: 'Snow', precipitation: 90, icon: 'snowy' },
    { date: '2024-01-19', high: 65, low: 40, condition: 'Partly Cloudy', precipitation: 20, icon: 'partly-cloudy' },
    { date: '2024-01-20', high: 70, low: 45, condition: 'Sunny', precipitation: 0, icon: 'sunny' },
    { date: '2024-01-21', high: 73, low: 48, condition: 'Sunny', precipitation: 5, icon: 'sunny' }
  ],
  alerts: [
    {
      id: '1',
      title: 'High Wind Warning',
      description: 'Winds up to 45 mph expected. Secure loose objects.',
      severity: 'moderate',
      expires: '2024-01-15T18:00:00Z'
    }
  ]
}

// Demo component for page.tsx
export default function WeatherAPIDemo() {
  const [selectedLocation, setSelectedLocation] = useState('Moab, UT')

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(15,23,42)] mb-2">Weather API</h1>
          <p className="text-[rgb(100,116,139)]">
            Get current conditions and forecasts for your off-road adventures
          </p>
        </div>
        <WeatherAPI
          location={selectedLocation}
          onLocationChange={setSelectedLocation}
          showForecast={true}
          showAlerts={true}
        />
      </div>
    </div>
  )
}