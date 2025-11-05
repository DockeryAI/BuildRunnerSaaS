'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Eye, AlertTriangle, MapPin, Calendar } from 'lucide-react'

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
}

interface TripWeatherDisplayProps {
  tripLocation?: string
  tripDates?: string[]
  onLocationChange?: (location: string) => void
  onRefresh?: () => void
}

export function TripWeatherDisplay({
  tripLocation = 'Moab, Utah',
  tripDates = ['2024-03-15', '2024-03-16', '2024-03-17'],
  onLocationChange = () => console.log('Location changed'),
  onRefresh = () => console.log('Weather refreshed')
}: TripWeatherDisplayProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData>(DEFAULT_WEATHER_DATA)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(0)

  useEffect(() => {
    // Simulate weather data fetch
    const fetchWeather = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWeatherData(DEFAULT_WEATHER_DATA)
      setLastUpdated(new Date())
      setIsLoading(false)
    }
    fetchWeather()
  }, [tripLocation])

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
        return 'bg-[rgb(248, 250, 252)] text-gray-800 border-[rgb(226, 232, 240)]'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsLoading(false)
    onRefresh()
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-xl border border-[rgb(226,232,240)] p-6 shadow-md animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 font-medium">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
          <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">{tripLocation}</h1>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(29,120,29)] transition-colors duration-150 font-medium text-sm shadow-md active:scale-95"
          aria-label="Refresh weather data"
        >
          Refresh
        </button>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <div className="space-y-2">
          {weatherData.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} shadow-sm`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <p className="text-sm mt-1 opacity-90">{alert.description}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {new Date(alert.startTime).toLocaleDateString()} - {new Date(alert.endTime).toLocaleDateString()}
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
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Current Conditions</h2>
          <span className="text-sm text-gray-500">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Trip Forecast */}
      <div className="bg-white rounded-xl border border-[rgb(226,232,240)] p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[rgb(34,139,34)]" />
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Trip Forecast</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tripDates.map((date, index) => {
            const forecast = weatherData.forecast[index]
            if (!forecast) return null

            return (
              <button
                key={date}
                onClick={() => setSelectedDay(index)}
                className={`p-4 rounded-lg border transition-all duration-150 text-left ${
                  selectedDay === index
                    ? 'border-[rgb(34,139,34)] bg-[rgb(245,247,250)] shadow-md'
                    : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)] hover:shadow-sm'
                }`}
                aria-pressed={selectedDay === index}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[rgb(15,23,42)]">
                    {formatDate(date)}
                  </span>
                  {getWeatherIcon(forecast.condition)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-[rgb(15,23,42)]">
                      {forecast.high}°
                    </div>
                    <div className="text-sm text-gray-500">
                      {forecast.low}°
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[rgb(34, 139, 34)]">
                      {forecast.precipitation}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {forecast.windSpeed} mph
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 capitalize">
                  {forecast.condition}
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Day Details */}
        {weatherData.forecast[selectedDay] && (
          <div className="mt-6 p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-3">
              {formatDate(tripDates[selectedDay])} Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">High/Low:</span>
                <div className="font-medium">
                  {weatherData.forecast[selectedDay].high}° / {weatherData.forecast[selectedDay].low}°
                </div>
              </div>
              <div>
                <span className="text-gray-500">Precipitation:</span>
                <div className="font-medium">{weatherData.forecast[selectedDay].precipitation}%</div>
              </div>
              <div>
                <span className="text-gray-500">Wind:</span>
                <div className="font-medium">{weatherData.forecast[selectedDay].windSpeed} mph</div>
              </div>
              <div>
                <span className="text-gray-500">Conditions:</span>
                <div className="font-medium capitalize">{weatherData.forecast[selectedDay].condition}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Packing Recommendations */}
      <div className="bg-white rounded-xl border border-[rgb(226,232,240)] p-6 shadow-md">
        <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Packing Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-[rgb(15,23,42)] mb-2">Essential Items</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Layered clothing (temps {Math.min(...weatherData.forecast.map(f => f.low))}° - {Math.max(...weatherData.forecast.map(f => f.high))}°)</li>
              <li>• Waterproof jacket</li>
              <li>• Sun protection (UV index {weatherData.current.uvIndex})</li>
              <li>• Extra water</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-[rgb(15,23,42)] mb-2">Weather-Specific</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {weatherData.forecast.some(f => f.precipitation > 30) && (
                <li>• Rain gear (precipitation expected)</li>
              )}
              {weatherData.forecast.some(f => f.windSpeed > 15) && (
                <li>• Wind-resistant clothing</li>
              )}
              {weatherData.current.uvIndex > 6 && (
                <li>• Extra sunscreen (high UV)</li>
              )}
              <li>• Emergency shelter</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_WEATHER_DATA: WeatherData = {
  id: '1',
  location: 'Moab, Utah',
  current: {
    temperature: 72,
    condition: 'sunny',
    humidity: 35,
    windSpeed: 8,
    visibility: 10,
    feelsLike: 75,
    uvIndex: 7
  },
  forecast: [
    {
      date: '2024-03-15',
      high: 75,
      low: 45,
      condition: 'sunny',
      precipitation: 5,
      windSpeed: 10
    },
    {
      date: '2024-03-16',
      high: 68,
      low: 42,
      condition: 'cloudy',
      precipitation: 20,
      windSpeed: 12
    },
    {
      date: '2024-03-17',
      high: 71,
      low: 48,
      condition: 'sunny',
      precipitation: 0,
      windSpeed: 8
    }
  ],
  alerts: [
    {
      id: 'alert-1',
      type: 'advisory',
      title: 'Wind Advisory',
      description: 'Gusty winds expected in exposed areas. Secure loose items.',
      severity: 'moderate',
      startTime: '2024-03-16T06:00:00Z',
      endTime: '2024-03-16T18:00:00Z'
    }
  ]
}

export default function TripWeatherDisplayDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <TripWeatherDisplay />
    </div>
  )
}