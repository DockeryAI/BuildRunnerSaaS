'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Zap, Wind, Eye, Droplets, Thermometer, AlertTriangle } from 'lucide-react'

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
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    expires: string
  }>
}

interface OpenWeatherMapProps {
  location?: string
  apiKey?: string
  onWeatherUpdate?: (weather: WeatherData) => void
  showForecast?: boolean
  showAlerts?: boolean
}

export function OpenWeatherMap({
  location = 'Moab, UT',
  apiKey = 'demo_key',
  onWeatherUpdate = () => {},
  showForecast = true,
  showAlerts = true
}: OpenWeatherMapProps = {}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWeather = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    setError(null)

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockWeather: WeatherData = {
        id: '1',
        location,
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
          { date: 'Today', high: 78, low: 52, condition: 'Sunny', precipitation: 0, icon: 'sunny' },
          { date: 'Tomorrow', high: 82, low: 55, condition: 'Partly Cloudy', precipitation: 10, icon: 'partly-cloudy' },
          { date: 'Wednesday', high: 75, low: 48, condition: 'Thunderstorms', precipitation: 80, icon: 'thunderstorm' },
          { date: 'Thursday', high: 68, low: 42, condition: 'Rainy', precipitation: 90, icon: 'rainy' },
          { date: 'Friday', high: 71, low: 45, condition: 'Cloudy', precipitation: 20, icon: 'cloudy' },
          { date: 'Saturday', high: 76, low: 50, condition: 'Sunny', precipitation: 0, icon: 'sunny' },
          { date: 'Sunday', high: 79, low: 53, condition: 'Partly Cloudy', precipitation: 5, icon: 'partly-cloudy' }
        ],
        alerts: [
          {
            id: '1',
            title: 'Flash Flood Watch',
            description: 'Heavy rainfall may cause flash flooding in low-lying areas and washes.',
            severity: 'moderate',
            expires: '2024-01-15T18:00:00Z'
          }
        ]
      }

      setWeather(mockWeather)
      onWeatherUpdate(mockWeather)
    } catch (err) {
      setError('Failed to fetch weather data. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [location])

  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />
      case 'partly-cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-600" />
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-[rgb(34, 139, 34)]" />
      case 'thunderstorm':
        return <Zap className="w-8 h-8 text-purple-500" />
      case 'snow':
        return <CloudSnow className="w-8 h-8 text-blue-300" />
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />
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

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white rounded-xl border border-[rgb(226,232,240)] p-6 shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl border border-[rgb(226,232,240)] p-6 shadow-md text-center">
          <AlertTriangle className="w-12 h-12 text-[rgb(220,38,38)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">Weather Unavailable</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchWeather()}
            className="w-full px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium text-sm shadow-md active:scale-95"
            aria-label="Retry fetching weather data"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 font-medium">
      {/* Weather Alerts */}
      {showAlerts && weather.alerts.length > 0 && (
        <div className="space-y-2">
          {weather.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{alert.title}</h4>
                  <p className="text-xs mt-1 opacity-90">{alert.description}</p>
                  <p className="text-xs mt-2 opacity-75">
                    Expires: {new Date(alert.expires).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <div className="bg-white rounded-xl border border-[rgb(226,232,240)] p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">{weather.location}</h2>
          <button
            onClick={() => fetchWeather(true)}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-[rgb(34,139,34)] transition-colors duration-150 disabled:opacity-50"
            aria-label="Refresh weather data"
          >
            <Wind className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          {getWeatherIcon(weather.current.icon)}
          <div className="flex-1">
            <div className="text-3xl font-bold text-[rgb(15,23,42)]">
              {weather.current.temperature}°F
            </div>
            <div className="text-sm text-gray-600">{weather.current.condition}</div>
            <div className="text-xs text-gray-500">
              Feels like {weather.current.feelsLike}°F
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Droplets className="w-5 h-5 text-[rgb(34, 139, 34)] mx-auto mb-1" />
            <div className="text-sm font-semibold text-[rgb(15,23,42)]">{weather.current.humidity}%</div>
            <div className="text-xs text-gray-500">Humidity</div>
          </div>
          <div className="text-center">
            <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
            <div className="text-sm font-semibold text-[rgb(15,23,42)]">{weather.current.windSpeed} mph</div>
            <div className="text-xs text-gray-500">Wind</div>
          </div>
          <div className="text-center">
            <Eye className="w-5 h-5 text-gray-500 mx-auto mb-1" />
            <div className="text-sm font-semibold text-[rgb(15,23,42)]">{weather.current.visibility} mi</div>
            <div className="text-xs text-gray-500">Visibility</div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      {showForecast && (
        <div className="bg-white rounded-xl border border-[rgb(226,232,240)] p-6 shadow-md">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">7-Day Forecast</h3>
          <div className="space-y-3">
            {weather.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3 flex-1">
                  {getWeatherIcon(day.icon)}
                  <div className="flex-1">
                    <div className="font-medium text-[rgb(15,23,42)] text-sm">{day.date}</div>
                    <div className="text-xs text-gray-600">{day.condition}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {day.precipitation > 0 && (
                    <div className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-[rgb(34, 139, 34)]" />
                      <span className="text-xs text-[rgb(34, 139, 34)]">{day.precipitation}%</span>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[rgb(15,23,42)]">{day.high}°</div>
                    <div className="text-xs text-gray-500">{day.low}°</div>
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

// Mock data for demo
const DEMO_LOCATIONS = [
  'Moab, UT',
  'Sedona, AZ',
  'Big Sur, CA',
  'Yellowstone, WY'
]

// Demo component for page.tsx
export default function OpenWeatherMapDemo() {
  const [selectedLocation, setSelectedLocation] = useState(DEMO_LOCATIONS[0])

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">Weather Forecast</h1>
          <p className="text-sm text-gray-600 mb-4">
            Stay informed about weather conditions for your off-road adventures
          </p>
          
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
            aria-label="Select location for weather forecast"
          >
            {DEMO_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <OpenWeatherMap
          location={selectedLocation}
          onWeatherUpdate={(weather) => console.log('Weather updated:', weather)}
          showForecast={true}
          showAlerts={true}
        />
      </div>
    </div>
  )
}