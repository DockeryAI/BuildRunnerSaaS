'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Thermometer, Droplets, Eye, AlertTriangle, MapPin, Calendar, RefreshCw } from 'lucide-react'

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
  showAlerts?: boolean
  showForecast?: boolean
  autoRefresh?: boolean
}

export function WeatherIntegration({
  location = 'Moab, UT',
  coordinates = { lat: 38.5733, lng: -109.5498 },
  onLocationChange = () => {},
  showAlerts = true,
  showForecast = true,
  autoRefresh = true
}: WeatherIntegrationProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const mockWeatherData: WeatherData = {
    id: '1',
    location,
    coordinates,
    current: {
      temperature: 72,
      condition: 'Partly Cloudy',
      humidity: 45,
      windSpeed: 8,
      visibility: 10,
      feelsLike: 75,
      uvIndex: 6
    },
    forecast: [
      { date: '2024-01-15', high: 75, low: 45, condition: 'Sunny', precipitation: 0, windSpeed: 5 },
      { date: '2024-01-16', high: 68, low: 42, condition: 'Partly Cloudy', precipitation: 10, windSpeed: 12 },
      { date: '2024-01-17', high: 62, low: 38, condition: 'Rain', precipitation: 80, windSpeed: 15 },
      { date: '2024-01-18', high: 58, low: 35, condition: 'Cloudy', precipitation: 20, windSpeed: 10 },
      { date: '2024-01-19', high: 65, low: 40, condition: 'Sunny', precipitation: 0, windSpeed: 8 },
      { date: '2024-01-20', high: 70, low: 44, condition: 'Partly Cloudy', precipitation: 5, windSpeed: 6 },
      { date: '2024-01-21', high: 73, low: 48, condition: 'Sunny', precipitation: 0, windSpeed: 4 }
    ],
    alerts: [
      {
        id: '1',
        type: 'warning',
        title: 'Flash Flood Warning',
        description: 'Flash flooding possible in low-lying areas and washes. Avoid camping in washes.',
        severity: 'moderate',
        startTime: '2024-01-17T06:00:00Z',
        endTime: '2024-01-17T18:00:00Z'
      }
    ],
    lastUpdated: new Date().toISOString()
  }

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setWeatherData(mockWeatherData)
      } catch (err) {
        setError('Failed to fetch weather data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [location, coordinates])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      setRefreshing(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setWeatherData(prev => prev ? { ...prev, lastUpdated: new Date().toISOString() } : null)
      } catch (err) {
        console.error('Auto-refresh failed:', err)
      } finally {
        setRefreshing(false)
      }
    }, 300000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-6 h-6 text-accent" />
      case 'partly cloudy':
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-mutedForeground" />
      case 'rain':
      case 'showers':
        return <CloudRain className="w-6 h-6 text-primary" />
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-primary" />
      default:
        return <Cloud className="w-6 h-6 text-mutedForeground" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'bg-destructive/10 border-destructive/30 text-destructive dark:bg-destructive/20 dark:border-destructive/40 dark:text-destructive'
      case 'severe':
        return 'bg-accent/10 border-accent/30 text-accent dark:bg-accent/20 dark:border-accent/40 dark:text-accent'
      case 'moderate':
        return 'bg-accent/10 border-accent/30 text-accent dark:bg-accent/20 dark:border-accent/40 dark:text-accent'
      default:
        return 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/40 dark:text-primary'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWeatherData(prev => prev ? { ...prev, lastUpdated: new Date().toISOString() } : null)
    } catch (err) {
      setError('Failed to refresh weather data')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-8 bg-muted rounded w-1/4"></div>
            </div>
          </div>
          
          <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background font-sans p-4 flex items-center justify-center">
        <div className="bg-surface rounded-xl border border-border p-8 text-center max-w-md shadow-lg">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Weather Data Unavailable</h3>
          <p className="text-mutedForeground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md"
            aria-label="Retry loading weather data"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  return (
    <div className="min-h-screen bg-background font-sans p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 hover:border-ring/50 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">{weatherData.location}</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-mutedForeground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg transition-all duration-150 disabled:opacity-50 hover:bg-muted active:scale-95"
              aria-label="Refresh weather data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-mutedForeground">
            Last updated: {new Date(weatherData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>

        {showAlerts && weatherData.alerts.length > 0 && (
          <div className="space-y-3">
            {weatherData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 ${getAlertColor(alert.severity)} shadow-sm hover:shadow-md transition-all duration-300`}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{alert.title}</h3>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <p className="text-xs opacity-75">
                      {formatDate(alert.startTime)} - {formatDate(alert.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-surface rounded-xl border border-border p-6 hover:border-ring/50 hover:shadow-md transition-all duration-300 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Current Conditions</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weatherData.current.condition)}
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {weatherData.current.temperature}°F
                </div>
                <div className="text-mutedForeground">{weatherData.current.condition}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-mutedForeground">Feels like</div>
              <div className="text-xl font-semibold text-foreground">
                {weatherData.current.feelsLike}°F
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors duration-150">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-xs text-mutedForeground">Humidity</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {weatherData.current.humidity}%
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors duration-150">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-mutedForeground" />
                <span className="text-xs text-mutedForeground">Wind</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {weatherData.current.windSpeed} mph
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors duration-150">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-mutedForeground" />
                <span className="text-xs text-mutedForeground">Visibility</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {weatherData.current.visibility} mi
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors duration-150">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-4 h-4 text-accent" />
                <span className="text-xs text-mutedForeground">UV Index</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {weatherData.current.uvIndex}
              </div>
            </div>
          </div>
        </div>

        {showForecast && (
          <div className="bg-surface rounded-xl border border-border p-6 hover:border-ring/50 hover:shadow-md transition-all duration-300 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">7-Day Forecast</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div
                  key={day.date}
                  className="bg-muted/50 rounded-lg p-4 text-center hover:bg-muted/70 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-sm font-medium text-mutedForeground mb-2">
                    {index === 0 ? 'Today' : formatDate(day.date)}
                  </div>
                  
                  <div className="flex justify-center mb-3">
                    {getWeatherIcon(day.condition)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-semibold">{day.high}°</span>
                      <span className="text-mutedForeground">{day.low}°</span>
                    </div>
                    
                    {day.precipitation > 0 && (
                      <div className="flex items-center justify-center gap-1 text-xs text-primary">
                        <Droplets className="w-3 h-3" />
                        <span>{day.precipitation}%</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-1 text-xs text-mutedForeground">
                      <Wind className="w-3 h-3" />
                      <span>{day.windSpeed} mph</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-surface rounded-xl border border-border p-6 hover:border-ring/50 hover:shadow-md transition-all duration-300 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Trip Planning Tips</h2>
          
          <div className="space-y-3">
            {weatherData.current.temperature > 80 && (
              <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/30">
                <Thermometer className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-accent">Hot Weather Advisory</div>
                  <div className="text-xs text-accent/80">Bring extra water and plan for shade during midday hours.</div>
                </div>
              </div>
            )}
            
            {weatherData.current.windSpeed > 15 && (
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
                <Wind className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-primary">Windy Conditions</div>
                  <div className="text-xs text-primary/80">Secure loose items and consider wind-resistant camping gear.</div>
                </div>
              </div>
            )}
            
            {weatherData.forecast.some(day => day.precipitation > 50) && (
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
                <CloudRain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-primary">Rain Expected</div>
                  <div className="text-xs text-primary/80">Pack waterproof gear and check trail conditions before heading out.</div>
                </div>
              </div>
            )}
            
            {weatherData.current.temperature <= 80 && weatherData.current.windSpeed <= 15 && !weatherData.forecast.some(day => day.precipitation > 50) && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Perfect Conditions</h3>
                <p className="text-mutedForeground text-sm">Great weather for outdoor activities!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WeatherIntegrationDemo() {
  return <WeatherIntegration />
}