'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Thermometer, Droplets, Eye, AlertTriangle, MapPin, Calendar, RefreshCw } from 'lucide-react'

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
    type: 'warning' | 'watch' | 'advisory'
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    expires: string
  }>
  lastUpdated: string
}

interface WeatherIntegrationProps {
  location?: string
  onLocationChange?: (location: string) => void
  showForecast?: boolean
  showAlerts?: boolean
  compact?: boolean
}

export function WeatherIntegration({
  location = 'Moab, UT',
  onLocationChange = () => {},
  showForecast = true,
  showAlerts = true,
  compact = false
}: WeatherIntegrationProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData>(mockWeatherData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState(location)

  useEffect(() => {
    fetchWeatherData(location)
  }, [location])

  const fetchWeatherData = async (loc: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update mock data with new location
      const updatedData = {
        ...mockWeatherData,
        location: loc,
        lastUpdated: new Date().toISOString()
      }
      
      setWeatherData(updatedData)
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      onLocationChange(searchLocation.trim())
      fetchWeatherData(searchLocation.trim())
    }
  }

  const handleRefresh = () => {
    fetchWeatherData(location)
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rainy':
      case 'rain':
        return <CloudRain className="w-6 h-6 text-[rgb(34, 139, 34)]" />
      case 'snowy':
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-blue-300" />
      default:
        return <Cloud className="w-6 h-6 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'moderate':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'severe':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'extreme':
        return 'bg-purple-100 border-purple-300 text-purple-800'
      default:
        return 'bg-[rgb(248, 250, 252)] border-gray-300 text-gray-800'
    }
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weatherData.current.condition)}
            <div>
              <p className="font-medium text-[rgb(15,23,42)]">{weatherData.current.temperature}°F</p>
              <p className="text-sm text-gray-600">{weatherData.current.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[rgb(15,23,42)]">{weatherData.location}</p>
            <p className="text-xs text-gray-500">
              {new Date(weatherData.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Weather Forecast</h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh weather data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Location Search */}
        <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6 shadow-md">
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <label htmlFor="location-search" className="block text-sm font-medium text-[rgb(15,23,42)]">
              Search Location
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="location-search"
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter city, state or coordinates"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px]"
                aria-label="Search location"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6 shadow-md">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Current Weather */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
                <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">{weatherData.location}</h2>
              </div>
              <p className="text-sm text-gray-500">
                Updated {new Date(weatherData.lastUpdated).toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Weather Info */}
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {getWeatherIcon(weatherData.current.condition)}
                </div>
                <div>
                  <p className="text-4xl font-bold text-[rgb(15,23,42)]">
                    {weatherData.current.temperature}°F
                  </p>
                  <p className="text-lg text-gray-600 capitalize">
                    {weatherData.current.condition}
                  </p>
                  <p className="text-sm text-gray-500">
                    Feels like {weatherData.current.feelsLike}°F
                  </p>
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
                  <Droplets className="w-5 h-5 text-[rgb(34, 139, 34)]" />
                  <div>
                    <p className="text-sm text-gray-600">Humidity</p>
                    <p className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
                  <Wind className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Wind</p>
                    <p className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.windSpeed} mph</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Visibility</p>
                    <p className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.visibility} mi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Feels Like</p>
                    <p className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.feelsLike}°F</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        {!isLoading && !error && showAlerts && weatherData.alerts.length > 0 && (
          <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6 shadow-md">
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[rgb(249,115,22)]" />
              Weather Alerts
            </h3>
            <div className="space-y-3">
              {weatherData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{alert.title}</h4>
                      <p className="text-sm mb-2">{alert.description}</p>
                      <p className="text-xs opacity-75">
                        Expires: {new Date(alert.expires).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-white/50 rounded text-xs font-medium uppercase tracking-wide">
                      {alert.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-Day Forecast */}
        {!isLoading && !error && showForecast && (
          <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6 shadow-md">
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[rgb(34,139,34)]" />
              7-Day Forecast
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div
                  key={index}
                  className="p-4 bg-[rgb(248,250,252)] rounded-lg text-center hover:bg-[rgb(248, 250, 252)] transition-colors duration-150"
                >
                  <p className="text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 capitalize">{day.condition}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[rgb(15,23,42)]">{day.high}°</p>
                    <p className="text-sm text-gray-500">{day.low}°</p>
                  </div>
                  {day.precipitation > 0 && (
                    <p className="text-xs text-[rgb(34, 139, 34)] mt-2">
                      {day.precipitation}% rain
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock weather data
const mockWeatherData: WeatherData = {
  id: '1',
  location: 'Moab, UT',
  current: {
    temperature: 75,
    condition: 'Sunny',
    humidity: 35,
    windSpeed: 8,
    visibility: 10,
    feelsLike: 78,
    icon: 'sunny'
  },
  forecast: [
    { date: '2024-01-15', high: 78, low: 52, condition: 'Sunny', precipitation: 0, icon: 'sunny' },
    { date: '2024-01-16', high: 72, low: 48, condition: 'Partly Cloudy', precipitation: 10, icon: 'partly-cloudy' },
    { date: '2024-01-17', high: 68, low: 45, condition: 'Cloudy', precipitation: 20, icon: 'cloudy' },
    { date: '2024-01-18', high: 65, low: 42, condition: 'Rainy', precipitation: 80, icon: 'rainy' },
    { date: '2024-01-19', high: 70, low: 46, condition: 'Partly Cloudy', precipitation: 15, icon: 'partly-cloudy' },
    { date: '2024-01-20', high: 74, low: 50, condition: 'Sunny', precipitation: 5, icon: 'sunny' },
    { date: '2024-01-21', high: 76, low: 53, condition: 'Sunny', precipitation: 0, icon: 'sunny' }
  ],
  alerts: [
    {
      id: '1',
      type: 'warning',
      title: 'High Wind Warning',
      description: 'Sustained winds of 35-45 mph with gusts up to 65 mph expected. Secure loose objects and avoid high-profile vehicles.',
      severity: 'moderate',
      expires: '2024-01-15T18:00:00Z'
    }
  ],
  lastUpdated: new Date().toISOString()
}

// Demo component for page.tsx
export default function WeatherIntegrationDemo() {
  return <WeatherIntegration />
}