'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Zap, Eye, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    visibility: number
    wind_speed: number
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
  }
  daily: Array<{
    dt: number
    temp: {
      min: number
      max: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    pop: number
  }>
  alerts?: Array<{
    event: string
    description: string
    start: number
    end: number
  }>
}

interface OpenWeatherMapProps {
  apiKey?: string
  lat?: number
  lon?: number
  units?: 'metric' | 'imperial'
  onWeatherUpdate?: (data: WeatherData) => void
}

export function OpenWeatherMap({
  apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '',
  lat = 40.7128,
  lon = -74.0060,
  units = 'imperial',
  onWeatherUpdate = () => {}
}: OpenWeatherMapProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!apiKey) {
      setError('OpenWeatherMap API key is required')
      setLoading(false)
      return
    }

    fetchWeatherData()
  }, [apiKey, lat, lon, units])

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=${units}`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      setWeatherData(data)
      onWeatherUpdate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string, size: 'sm' | 'lg' = 'sm') => {
    const iconSize = size === 'lg' ? 'w-12 h-12' : 'w-6 h-6'
    const iconColor = 'text-[rgb(34,139,34)]'

    switch (iconCode.slice(0, 2)) {
      case '01': return <Sun className={`${iconSize} ${iconColor}`} />
      case '02':
      case '03':
      case '04': return <Cloud className={`${iconSize} ${iconColor}`} />
      case '09':
      case '10': return <CloudRain className={`${iconSize} ${iconColor}`} />
      case '11': return <Zap className={`${iconSize} ${iconColor}`} />
      case '13': return <CloudSnow className={`${iconSize} ${iconColor}`} />
      default: return <Sun className={`${iconSize} ${iconColor}`} />
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const tempUnit = units === 'metric' ? '°C' : '°F'
  const speedUnit = units === 'metric' ? 'm/s' : 'mph'

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[rgb(241,245,249)] rounded w-1/3"></div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[rgb(241,245,249)] rounded"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-[rgb(241,245,249)] rounded w-1/4"></div>
                <div className="h-4 bg-[rgb(241,245,249)] rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-[rgb(241,245,249)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-[rgb(241,245,249)] rounded w-3/4"></div>
                <div className="w-8 h-8 bg-[rgb(241,245,249)] rounded mx-auto"></div>
                <div className="h-4 bg-[rgb(241,245,249)] rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(239,68,68)] p-6">
          <div className="flex items-center space-x-3 text-[rgb(239,68,68)]">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-[rgb(15,23,42)]">Weather Error</h3>
              <p className="text-sm text-[rgb(15,23,42)]">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchWeatherData}
            className="mt-4 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors font-medium"
            aria-label="Retry fetching weather data"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-medium">
      {/* Weather Alerts */}
      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(245,158,11)] p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-[rgb(245,158,11)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Weather Alerts</h3>
              {weatherData.alerts.map((alert, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <h4 className="font-medium text-[rgb(15,23,42)] text-sm">{alert.event}</h4>
                  <p className="text-sm text-[rgb(15,23,42)]/70 mt-1">{alert.description}</p>
                  <p className="text-xs text-[rgb(15,23,42)]/60 mt-1">
                    {new Date(alert.start * 1000).toLocaleDateString()} - {new Date(alert.end * 1000).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Current Weather */}
      <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-4">Current Weather</h2>
        
        <div className="flex items-center space-x-6 mb-6">
          {getWeatherIcon(weatherData.current.weather[0].icon, 'lg')}
          <div>
            <div className="text-3xl font-bold text-[rgb(15,23,42)]">
              {Math.round(weatherData.current.temp)}{tempUnit}
            </div>
            <div className="text-sm text-[rgb(15,23,42)]/70 capitalize">
              {weatherData.current.weather[0].description}
            </div>
            <div className="text-sm text-[rgb(15,23,42)]/60">
              Feels like {Math.round(weatherData.current.feels_like)}{tempUnit}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
            <Droplets className="w-5 h-5 text-[rgb(34,139,34)]" />
            <div>
              <div className="text-sm font-medium text-[rgb(15,23,42)]">{weatherData.current.humidity}%</div>
              <div className="text-xs text-[rgb(15,23,42)]/60">Humidity</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
            <Wind className="w-5 h-5 text-[rgb(34,139,34)]" />
            <div>
              <div className="text-sm font-medium text-[rgb(15,23,42)]">
                {Math.round(weatherData.current.wind_speed)} {speedUnit}
              </div>
              <div className="text-xs text-[rgb(15,23,42)]/60">Wind</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
            <Eye className="w-5 h-5 text-[rgb(34,139,34)]" />
            <div>
              <div className="text-sm font-medium text-[rgb(15,23,42)]">
                {Math.round(weatherData.current.visibility / 1000)} km
              </div>
              <div className="text-xs text-[rgb(15,23,42)]/60">Visibility</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
            <Thermometer className="w-5 h-5 text-[rgb(34,139,34)]" />
            <div>
              <div className="text-sm font-medium text-[rgb(15,23,42)]">
                {Math.round(weatherData.current.feels_like)}{tempUnit}
              </div>
              <div className="text-xs text-[rgb(15,23,42)]/60">Feels Like</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-4">7-Day Forecast</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weatherData.daily.slice(0, 7).map((day, index) => (
            <div
              key={day.dt}
              className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center hover:bg-[rgb(241,245,249)] transition-colors"
            >
              <div className="text-sm font-medium text-[rgb(15,23,42)] mb-2">
                {index === 0 ? 'Today' : formatDate(day.dt)}
              </div>
              
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.weather[0].icon)}
              </div>
              
              <div className="text-xs text-[rgb(15,23,42)]/70 mb-2 capitalize">
                {day.weather[0].description}
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[rgb(15,23,42)]">
                  {Math.round(day.temp.max)}{tempUnit}
                </div>
                <div className="text-xs text-[rgb(15,23,42)]/60">
                  {Math.round(day.temp.min)}{tempUnit}
                </div>
                {day.pop > 0 && (
                  <div className="text-xs text-[rgb(34,139,34)]">
                    {Math.round(day.pop * 100)}% rain
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchWeatherData}
          disabled={loading}
          className="px-6 py-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-h-[44px] min-w-[44px]"
          aria-label="Refresh weather data"
        >
          {loading ? 'Updating...' : 'Refresh Weather'}
        </button>
      </div>
    </div>
  )
}

// Mock data for demo when API key is not available
const MOCK_WEATHER_DATA: WeatherData = {
  current: {
    temp: 72,
    feels_like: 75,
    humidity: 65,
    visibility: 10000,
    wind_speed: 8.5,
    weather: [{
      main: 'Clear',
      description: 'clear sky',
      icon: '01d'
    }]
  },
  daily: [
    {
      dt: Date.now() / 1000,
      temp: { min: 58, max: 75 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      pop: 0
    },
    {
      dt: Date.now() / 1000 + 86400,
      temp: { min: 62, max: 78 },
      weather: [{ main: 'Clouds', description: 'partly cloudy', icon: '02d' }],
      pop: 0.2
    },
    {
      dt: Date.now() / 1000 + 172800,
      temp: { min: 55, max: 68 },
      weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
      pop: 0.8
    },
    {
      dt: Date.now() / 1000 + 259200,
      temp: { min: 60, max: 72 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      pop: 0
    },
    {
      dt: Date.now() / 1000 + 345600,
      temp: { min: 65, max: 80 },
      weather: [{ main: 'Clear', description: 'sunny', icon: '01d' }],
      pop: 0
    },
    {
      dt: Date.now() / 1000 + 432000,
      temp: { min: 58, max: 75 },
      weather: [{ main: 'Clouds', description: 'overcast', icon: '04d' }],
      pop: 0.3
    },
    {
      dt: Date.now() / 1000 + 518400,
      temp: { min: 52, max: 70 },
      weather: [{ main: 'Rain', description: 'moderate rain', icon: '10d' }],
      pop: 0.9
    }
  ],
  alerts: [
    {
      event: 'Severe Thunderstorm Warning',
      description: 'Severe thunderstorms possible with heavy rain and strong winds. Seek shelter indoors.',
      start: Date.now() / 1000,
      end: Date.now() / 1000 + 3600
    }
  ]
}

// Demo component for page.tsx
export default function OpenWeatherMapDemo() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)

  // Use mock data for demo
  const handleWeatherUpdate = (data: WeatherData) => {
    setWeatherData(data)
    console.log('Weather updated:', data)
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(15,23,42)] mb-2">Weather Service</h1>
          <p className="text-[rgb(15,23,42)]/70">
            Real-time weather data and 7-day forecasts for your off-road adventures
          </p>
        </div>
        
        <OpenWeatherMap
          lat={39.7392}
          lon={-104.9903}
          units="imperial"
          onWeatherUpdate={handleWeatherUpdate}
        />
        
        {weatherData && (
          <div className="mt-8 p-4 bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)]">
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Weather Data Received</h3>
            <p className="text-sm text-[rgb(15,23,42)]/70">
              Current temperature: {Math.round(weatherData.current.temp)}°F
            </p>
          </div>
        )}
      </div>
    </div>
  )
}