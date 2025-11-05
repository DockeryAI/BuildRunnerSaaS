'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Thermometer, Droplets, Eye, AlertTriangle, MapPin, Calendar, Clock } from 'lucide-react'

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
    uvIndex: number
  }
  forecast: Array<{
    date: string
    high: number
    low: number
    condition: string
    precipitation: number
  }>
  alerts: Array<{
    id: string
    type: 'warning' | 'watch' | 'advisory'
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    expires: string
  }>
}

interface WeatherIntegrationProps {
  location?: string
  showForecast?: boolean
  showAlerts?: boolean
  onLocationChange?: (location: string) => void
}

const MOCK_WEATHER_DATA: WeatherData = {
  id: '1',
  location: 'Moab, Utah',
  current: {
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 45,
    windSpeed: 8,
    visibility: 10,
    feelsLike: 75,
    uvIndex: 7
  },
  forecast: [
    { date: '2024-01-15', high: 75, low: 45, condition: 'Sunny', precipitation: 0 },
    { date: '2024-01-16', high: 78, low: 48, condition: 'Partly Cloudy', precipitation: 10 },
    { date: '2024-01-17', high: 68, low: 42, condition: 'Cloudy', precipitation: 30 },
    { date: '2024-01-18', high: 65, low: 40, condition: 'Rain', precipitation: 80 },
    { date: '2024-01-19', high: 70, low: 44, condition: 'Partly Cloudy', precipitation: 20 },
    { date: '2024-01-20', high: 73, low: 46, condition: 'Sunny', precipitation: 0 },
    { date: '2024-01-21', high: 76, low: 49, condition: 'Sunny', precipitation: 0 }
  ],
  alerts: [
    {
      id: '1',
      type: 'warning',
      title: 'High Wind Warning',
      description: 'Sustained winds 25-35 mph with gusts up to 55 mph expected.',
      severity: 'moderate',
      expires: '2024-01-16T18:00:00Z'
    }
  ]
}

const getWeatherIcon = (condition: string) => {
  const iconClass = "w-6 h-6"
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun className={`${iconClass} text-[rgb(245,158,11)]`} />
    case 'partly cloudy':
      return <Cloud className={`${iconClass} text-[rgb(107,114,128)]`} />
    case 'cloudy':
      return <Cloud className={`${iconClass} text-[rgb(75,85,99)]`} />
    case 'rain':
    case 'showers':
      return <CloudRain className={`${iconClass} text-[rgb(59,130,246)]`} />
    case 'snow':
      return <CloudSnow className={`${iconClass} text-[rgb(156,163,175)]`} />
    default:
      return <Sun className={`${iconClass} text-[rgb(245,158,11)]`} />
  }
}

const getAlertColor = (severity: string) => {
  switch (severity) {
    case 'extreme':
      return 'bg-[rgb(220,38,38)] text-white border-[rgb(220,38,38)]'
    case 'severe':
      return 'bg-[rgb(245,158,11)] text-white border-[rgb(245,158,11)]'
    case 'moderate':
      return 'bg-[rgb(245,158,11)]/20 text-[rgb(245,158,11)] border-[rgb(245,158,11)]/30'
    default:
      return 'bg-[rgb(34,139,34)]/20 text-[rgb(34,139,34)] border-[rgb(34,139,34)]/30'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function WeatherIntegration({
  location = 'Moab, Utah',
  showForecast = true,
  showAlerts = true,
  onLocationChange = () => {}
}: WeatherIntegrationProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData>(MOCK_WEATHER_DATA)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(location)

  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    const timer = setTimeout(() => {
      setWeatherData({
        ...MOCK_WEATHER_DATA,
        location: selectedLocation
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [selectedLocation])

  const handleLocationChange = (newLocation: string) => {
    setSelectedLocation(newLocation)
    onLocationChange(newLocation)
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-[rgb(241,245,249)] rounded w-1/3"></div>
            <div className="h-12 bg-[rgb(241,245,249)] rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-[rgb(241,245,249)] rounded"></div>
              <div className="h-20 bg-[rgb(241,245,249)] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 font-medium">
      {/* Location Selector */}
      <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
          <input
            type="text"
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(107,114,128)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
            placeholder="Enter location..."
            aria-label="Weather location"
          />
        </div>
      </div>

      {/* Weather Alerts */}
      {showAlerts && weatherData.alerts.length > 0 && (
        <div className="space-y-3">
          {weatherData.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 shadow-md ${getAlertColor(alert.severity)}`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <p className="text-sm mt-1 opacity-90">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>Expires: {new Date(alert.expires).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Current Weather</h2>
          <div className="flex items-center gap-2 text-sm text-[rgb(107,114,128)]">
            <Clock className="w-4 h-4" />
            <span>Updated now</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Weather Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weatherData.current.condition)}
              <div>
                <div className="text-3xl font-bold text-[rgb(15,23,42)]">
                  {weatherData.current.temperature}°F
                </div>
                <div className="text-sm text-[rgb(107,114,128)]">
                  {weatherData.current.condition}
                </div>
              </div>
            </div>
            <div className="text-sm text-[rgb(107,114,128)]">
              Feels like {weatherData.current.feelsLike}°F
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-[rgb(248,250,252)] rounded-lg">
              <Droplets className="w-4 h-4 text-[rgb(59,130,246)]" />
              <div>
                <div className="text-xs text-[rgb(107,114,128)]">Humidity</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[rgb(248,250,252)] rounded-lg">
              <Wind className="w-4 h-4 text-[rgb(107,114,128)]" />
              <div>
                <div className="text-xs text-[rgb(107,114,128)]">Wind</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.windSpeed} mph</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[rgb(248,250,252)] rounded-lg">
              <Eye className="w-4 h-4 text-[rgb(107,114,128)]" />
              <div>
                <div className="text-xs text-[rgb(107,114,128)]">Visibility</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.visibility} mi</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[rgb(248,250,252)] rounded-lg">
              <Sun className="w-4 h-4 text-[rgb(245,158,11)]" />
              <div>
                <div className="text-xs text-[rgb(107,114,128)]">UV Index</div>
                <div className="font-semibold text-[rgb(15,23,42)]">{weatherData.current.uvIndex}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      {showForecast && (
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[rgb(34,139,34)]" />
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">7-Day Forecast</h2>
          </div>

          <div className="space-y-3">
            {weatherData.forecast.map((day, index) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[rgb(248,250,252)] transition-colors duration-150"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 text-sm font-medium text-[rgb(15,23,42)]">
                    {index === 0 ? 'Today' : formatDate(day.date)}
                  </div>
                  {getWeatherIcon(day.condition)}
                  <div className="text-sm text-[rgb(107,114,128)]">{day.condition}</div>
                </div>

                <div className="flex items-center gap-4">
                  {day.precipitation > 0 && (
                    <div className="flex items-center gap-1 text-xs text-[rgb(59,130,246)]">
                      <Droplets className="w-3 h-3" />
                      <span>{day.precipitation}%</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-[rgb(15,23,42)]">{day.high}°</span>
                    <span className="text-[rgb(107,114,128)]">{day.low}°</span>
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

export default function WeatherIntegrationDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <WeatherIntegration />
    </div>
  )
}