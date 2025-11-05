'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Zap, Wind, Thermometer, Droplets, Eye, Gauge, AlertTriangle } from 'lucide-react'

interface WeatherData {
  id: string
  location: string
  current: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
    visibility: number
    pressure: number
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
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    startTime: string
    endTime: string
  }>
}

interface OpenWeatherMapProps {
  location?: string
  apiKey?: string
  units?: 'metric' | 'imperial'
  onWeatherUpdate?: (weather: WeatherData) => void
}

export function OpenWeatherMap({
  location = 'Moab, UT',
  apiKey = 'demo_key',
  units = 'imperial',
  onWeatherUpdate = () => {}
}: OpenWeatherMapProps = {}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockWeather: WeatherData = {
          id: '1',
          location: location,
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
            { date: 'Tomorrow', high: 82, low: 55, condition: 'Partly Cloudy', precipitation: 10 },
            { date: 'Wednesday', high: 75, low: 48, condition: 'Cloudy', precipitation: 30 },
            { date: 'Thursday', high: 68, low: 42, condition: 'Rain', precipitation: 80 },
            { date: 'Friday', high: 71, low: 45, condition: 'Partly Cloudy', precipitation: 20 },
            { date: 'Saturday', high: 76, low: 50, condition: 'Sunny', precipitation: 0 },
            { date: 'Sunday', high: 79, low: 53, condition: 'Sunny', precipitation: 5 }
          ],
          alerts: [
            {
              id: '1',
              title: 'High Wind Warning',
              description: 'Winds up to 45 mph expected in exposed areas. Secure loose objects.',
              severity: 'moderate',
              startTime: '2024-01-15T14:00:00Z',
              endTime: '2024-01-15T22:00:00Z'
            }
          ]
        }
        
        setWeather(mockWeather)
        onWeatherUpdate(mockWeather)
      } catch (err) {
        setError('Failed to fetch weather data. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [location, apiKey, units, onWeatherUpdate])

  const getWeatherIcon = (condition: string) => {
    const iconClass = "w-8 h-8"
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className={`${iconClass} text-[rgb(245,158,11)]`} />
      case 'partly cloudy':
        return <Cloud className={`${iconClass} text-[rgb(107,114,128)]`} />
      case 'cloudy':
        return <Cloud className={`${iconClass} text-[rgb(75,85,99)]`} />
      case 'rain':
        return <CloudRain className={`${iconClass} text-[rgb(59,130,246)]`} />
      case 'snow':
        return <CloudSnow className={`${iconClass} text-[rgb(156,163,175)]`} />
      case 'thunderstorm':
        return <Zap className={`${iconClass} text-[rgb(245,158,11)]`} />
      default:
        return <Sun className={`${iconClass} text-[rgb(245,158,11)]`} />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-[rgb(254,240,138)] text-[rgb(146,64,14)] border-[rgb(251,191,36)]'
      case 'moderate':
        return 'bg-[rgb(254,215,170)] text-[rgb(154,52,18)] border-[rgb(251,146,60)]'
      case 'severe':
        return 'bg-[rgb(254,202,202)] text-[rgb(153,27,27)] border-[rgb(248,113,113)]'
      case 'extreme':
        return 'bg-[rgb(220,38,38)] text-white border-[rgb(185,28,28)]'
      default:
        return 'bg-[rgb(241,245,249)] text-[rgb(71,85,105)] border-[rgb(226,232,240)]'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Header Skeleton */}
          <div className="bg-[rgb(241,245,249)] rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-[rgb(226,232,240)] rounded mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 bg-[rgb(226,232,240)] rounded-full"></div>
              <div className="h-8 w-16 bg-[rgb(226,232,240)] rounded"></div>
            </div>
          </div>
          
          {/* Forecast Skeleton */}
          <div className="bg-[rgb(241,245,249)] rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-[rgb(226,232,240)] rounded mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-20 bg-[rgb(226,232,240)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="w-12 h-12 text-[rgb(220,38,38)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-2">Weather Unavailable</h2>
          <p className="text-[rgb(71,85,105)] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium hover:bg-[rgb(22,101,52)] transition-colors duration-200 shadow-md active:scale-95"
            aria-label="Retry loading weather data"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Weather Alerts */}
        {weather.alerts.length > 0 && (
          <div className="space-y-2">
            {weather.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border-2 ${getSeverityColor(alert.severity)}`}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm">{alert.title}</h3>
                    <p className="text-sm mt-1">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Weather */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">{weather.location}</h1>
              <p className="text-[rgb(71,85,105)] text-sm">Current Conditions</p>
            </div>
            {getWeatherIcon(weather.current.condition)}
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-4xl font-bold text-[rgb(15,23,42)]">
                {weather.current.temperature}°
              </div>
              <div className="text-[rgb(71,85,105)] text-sm">
                Feels like {weather.current.feelsLike}°
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-[rgb(15,23,42)]">
                {weather.current.condition}
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[rgb(59,130,246)]" />
              <div>
                <div className="text-sm text-[rgb(71,85,105)]">Humidity</div>
                <div className="font-medium text-[rgb(15,23,42)]">{weather.current.humidity}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[rgb(107,114,128)]" />
              <div>
                <div className="text-sm text-[rgb(71,85,105)]">Wind</div>
                <div className="font-medium text-[rgb(15,23,42)]">{weather.current.windSpeed} mph</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[rgb(107,114,128)]" />
              <div>
                <div className="text-sm text-[rgb(71,85,105)]">Visibility</div>
                <div className="font-medium text-[rgb(15,23,42)]">{weather.current.visibility} mi</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[rgb(107,114,128)]" />
              <div>
                <div className="text-sm text-[rgb(71,85,105)]">Pressure</div>
                <div className="font-medium text-[rgb(15,23,42)]">{weather.current.pressure}"</div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">7-Day Forecast</h2>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weather.forecast.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`p-2 rounded-lg text-center transition-all duration-200 ${
                  selectedDay === index
                    ? 'bg-[rgb(34,139,34)] text-white shadow-md'
                    : 'bg-white text-[rgb(71,85,105)] hover:bg-[rgb(241,245,249)]'
                }`}
                aria-label={`View forecast for ${day.date}`}
              >
                <div className="text-xs font-medium mb-1">
                  {day.date === 'Today' ? 'Today' : day.date.slice(0, 3)}
                </div>
                <div className="flex justify-center mb-1">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="text-xs">
                  <div className="font-semibold">{day.high}°</div>
                  <div className="opacity-70">{day.low}°</div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Day Details */}
          <div className="bg-white rounded-lg p-4 border border-[rgb(226,232,240)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[rgb(15,23,42)]">
                {weather.forecast[selectedDay].date}
              </h3>
              {getWeatherIcon(weather.forecast[selectedDay].condition)}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-[rgb(71,85,105)] mb-1">High</div>
                <div className="font-semibold text-[rgb(15,23,42)]">
                  {weather.forecast[selectedDay].high}°
                </div>
              </div>
              <div>
                <div className="text-xs text-[rgb(71,85,105)] mb-1">Low</div>
                <div className="font-semibold text-[rgb(15,23,42)]">
                  {weather.forecast[selectedDay].low}°
                </div>
              </div>
              <div>
                <div className="text-xs text-[rgb(71,85,105)] mb-1">Rain</div>
                <div className="font-semibold text-[rgb(15,23,42)]">
                  {weather.forecast[selectedDay].precipitation}%
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="text-sm font-medium text-[rgb(15,23,42)]">
                {weather.forecast[selectedDay].condition}
              </div>
            </div>
          </div>
        </div>

        {/* Trip Planning Insights */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Trip Planning Insights</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[rgb(226,232,240)]">
              <Thermometer className="w-5 h-5 text-[rgb(34,139,34)] mt-0.5" />
              <div>
                <div className="font-medium text-[rgb(15,23,42)] text-sm">Temperature Range</div>
                <div className="text-xs text-[rgb(71,85,105)]">
                  Pack layers for {Math.min(...weather.forecast.map(d => d.low))}° - {Math.max(...weather.forecast.map(d => d.high))}° range
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[rgb(226,232,240)]">
              <CloudRain className="w-5 h-5 text-[rgb(59,130,246)] mt-0.5" />
              <div>
                <div className="font-medium text-[rgb(15,23,42)] text-sm">Precipitation Outlook</div>
                <div className="text-xs text-[rgb(71,85,105)]">
                  {weather.forecast.some(d => d.precipitation > 50) 
                    ? 'Rain expected - bring waterproof gear'
                    : 'Mostly dry conditions expected'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[rgb(226,232,240)]">
              <Wind className="w-5 h-5 text-[rgb(107,114,128)] mt-0.5" />
              <div>
                <div className="font-medium text-[rgb(15,23,42)] text-sm">Wind Conditions</div>
                <div className="text-xs text-[rgb(71,85,105)]">
                  {weather.current.windSpeed > 15 
                    ? 'High winds - secure camp equipment'
                    : 'Calm conditions for outdoor activities'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OpenWeatherMapDemo() {
  return <OpenWeatherMap />
}