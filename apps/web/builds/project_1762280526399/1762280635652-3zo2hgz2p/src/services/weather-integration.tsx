'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Eye, AlertTriangle, MapPin, Calendar, RefreshCw } from 'lucide-react'

interface WeatherData {
  id: string
  location: string
  coordinates: { lat: number; lng: number }
  current: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
    visibility: number
    feelsLike: number
    uvIndex: number
  }
  forecast: Array<{
    date: string
    high: number
    low: number
    condition: string
    precipitation: number
    windSpeed: number
  }>
  alerts: Array<{
    id: string
    type: 'warning' | 'watch' | 'advisory'
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    startTime: string
    endTime: string
  }>
  lastUpdated: string
}

interface WeatherIntegrationProps {
  location?: string
  coordinates?: { lat: number; lng: number }
  onLocationChange?: (location: string, coordinates: { lat: number; lng: number }) => void
  onWeatherUpdate?: (weather: WeatherData) => void
  showAlerts?: boolean
  showForecast?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function WeatherIntegration({
  location = 'Moab, Utah',
  coordinates = { lat: 38.5733, lng: -109.5498 },
  onLocationChange = () => {},
  onWeatherUpdate = () => {},
  showAlerts = true,
  showForecast = true,
  autoRefresh = true,
  refreshInterval = 300000
}: WeatherIntegrationProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData>(DEFAULT_WEATHER_DATA)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    fetchWeatherData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchWeatherData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [location, coordinates, autoRefresh, refreshInterval])

  const fetchWeatherData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedWeather = {
        ...DEFAULT_WEATHER_DATA,
        location,
        coordinates,
        lastUpdated: new Date().toISOString()
      }
      
      setWeatherData(updatedWeather)
      setLastRefresh(new Date())
      onWeatherUpdate(updatedWeather)
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy':
      case 'overcast':
        return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rainy':
      case 'rain':
        return <CloudRain className="w-6 h-6 text-[rgb(34, 139, 34)]" />
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'extreme':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-[rgb(241, 245, 249)] text-gray-800 border-[rgb(226, 232, 240)]'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border border-[rgb(226,232,240)]">
        <div className="flex items-center gap-3 text-[rgb(239,68,68)] mb-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Weather Error</span>
        </div>
        <p className="text-[rgb(15,23,42)] mb-4">{error}</p>
        <button
          onClick={fetchWeatherData}
          className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors font-medium"
          aria-label="Retry fetching weather data"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
          <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Weather</h2>
        </div>
        <button
          onClick={fetchWeatherData}
          disabled={isLoading}
          className="p-2 rounded-md hover:bg-[rgb(241,245,249)] transition-colors disabled:opacity-50"
          aria-label="Refresh weather data"
        >
          <RefreshCw className={`w-5 h-5 text-[rgb(15,23,42)] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[rgb(34,139,34)]" />
            <span className="font-medium text-[rgb(15,23,42)]">{weatherData.location}</span>
          </div>
          <span className="text-sm text-gray-500">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature and Condition */}
          <div className="flex items-center gap-4">
            {getWeatherIcon(weatherData.current.condition)}
            <div>
              <div className="text-3xl font-bold text-[rgb(15,23,42)]">
                {weatherData.current.temperature}°F
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {weatherData.current.condition}
              </div>
              <div className="text-sm text-gray-500">
                Feels like {weatherData.current.feelsLike}°F
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[rgb(34, 139, 34)]" />
              <div>
                <div className="text-sm font-medium">{weatherData.current.humidity}%</div>
                <div className="text-xs text-gray-500">Humidity</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">{weatherData.current.windSpeed} mph</div>
                <div className="text-xs text-gray-500">Wind</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">{weatherData.current.visibility} mi</div>
                <div className="text-xs text-gray-500">Visibility</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="text-sm font-medium">{weatherData.current.uvIndex}</div>
                <div className="text-xs text-gray-500">UV Index</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {showAlerts && weatherData.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[rgb(245,158,11)]" />
            Weather Alerts
          </h3>
          {weatherData.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{alert.title}</h4>
                <span className="text-xs px-2 py-1 rounded-full bg-white/50 uppercase font-medium">
                  {alert.type}
                </span>
              </div>
              <p className="text-sm mb-2">{alert.description}</p>
              <div className="text-xs opacity-75">
                {formatTime(alert.startTime)} - {formatTime(alert.endTime)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7-Day Forecast */}
      {showForecast && (
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[rgb(34,139,34)]" />
            7-Day Forecast
          </h3>
          <div className="space-y-3">
            {weatherData.forecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-md hover:bg-[rgb(248,250,252)] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getWeatherIcon(day.condition)}
                  <div>
                    <div className="font-medium text-[rgb(15,23,42)]">
                      {formatTime(day.date)}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {day.condition}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[rgb(34, 139, 34)]" />
                    <span>{day.precipitation}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-gray-500" />
                    <span>{day.windSpeed} mph</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[rgb(15,23,42)]">{day.high}°</div>
                    <div className="text-gray-500">{day.low}°</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Mock weather data
const DEFAULT_WEATHER_DATA: WeatherData = {
  id: '1',
  location: 'Moab, Utah',
  coordinates: { lat: 38.5733, lng: -109.5498 },
  current: {
    temperature: 72,
    condition: 'Sunny',
    humidity: 35,
    windSpeed: 8,
    visibility: 10,
    feelsLike: 75,
    uvIndex: 7
  },
  forecast: [
    {
      date: new Date().toISOString(),
      high: 75,
      low: 45,
      condition: 'Sunny',
      precipitation: 0,
      windSpeed: 8
    },
    {
      date: new Date(Date.now() + 86400000).toISOString(),
      high: 78,
      low: 48,
      condition: 'Partly Cloudy',
      precipitation: 10,
      windSpeed: 12
    },
    {
      date: new Date(Date.now() + 172800000).toISOString(),
      high: 73,
      low: 42,
      condition: 'Cloudy',
      precipitation: 25,
      windSpeed: 15
    },
    {
      date: new Date(Date.now() + 259200000).toISOString(),
      high: 68,
      low: 38,
      condition: 'Rainy',
      precipitation: 80,
      windSpeed: 18
    },
    {
      date: new Date(Date.now() + 345600000).toISOString(),
      high: 71,
      low: 41,
      condition: 'Partly Cloudy',
      precipitation: 15,
      windSpeed: 10
    },
    {
      date: new Date(Date.now() + 432000000).toISOString(),
      high: 76,
      low: 46,
      condition: 'Sunny',
      precipitation: 5,
      windSpeed: 7
    },
    {
      date: new Date(Date.now() + 518400000).toISOString(),
      high: 79,
      low: 49,
      condition: 'Sunny',
      precipitation: 0,
      windSpeed: 9
    }
  ],
  alerts: [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'High Wind Warning',
      description: 'Winds up to 45 mph expected. Secure loose objects and avoid high-profile vehicles.',
      severity: 'moderate',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 172800000).toISOString()
    }
  ],
  lastUpdated: new Date().toISOString()
}

// Demo component for page.tsx
export default function WeatherIntegrationDemo() {
  const [selectedLocation, setSelectedLocation] = useState('Moab, Utah')
  
  const handleLocationChange = (location: string, coordinates: { lat: number; lng: number }) => {
    setSelectedLocation(location)
    console.log('Location changed:', location, coordinates)
  }
  
  const handleWeatherUpdate = (weather: WeatherData) => {
    console.log('Weather updated:', weather)
  }
  
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(15,23,42)] mb-2">
            Weather Integration
          </h1>
          <p className="text-gray-600">
            Real-time weather conditions and forecasts for your off-road adventures
          </p>
        </div>
        
        <WeatherIntegration
          location={selectedLocation}
          onLocationChange={handleLocationChange}
          onWeatherUpdate={handleWeatherUpdate}
          showAlerts={true}
          showForecast={true}
          autoRefresh={true}
        />
      </div>
    </div>
  )
}