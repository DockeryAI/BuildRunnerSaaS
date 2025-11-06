'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Zap, Eye, Wind, Droplets, Thermometer, AlertTriangle, MapPin, Calendar, Clock } from 'lucide-react'

interface WeatherData {
  id: string
  location: string
  coordinates: {
    lat: number
    lon: number
  }
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    windDirection: number
    visibility: number
    pressure: number
    uvIndex: number
    condition: string
    icon: string
    description: string
  }
  forecast: Array<{
    date: string
    day: string
    high: number
    low: number
    condition: string
    icon: string
    precipitation: number
    windSpeed: number
    humidity: number
  }>
  alerts: Array<{
    id: string
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    start: string
    end: string
  }>
  lastUpdated: string
}

interface WeatherServiceProps {
  location?: string
  coordinates?: { lat: number; lon: number }
  onLocationSelect?: (location: string, coordinates: { lat: number; lon: number }) => void
  showAlerts?: boolean
  showForecast?: boolean
  apiKey?: string
}

export function WeatherService({
  location = 'Moab, UT',
  coordinates = { lat: 38.5733, lon: -109.5498 },
  onLocationSelect = () => console.log('Location selected'),
  showAlerts = true,
  showForecast = true,
  apiKey = 'demo_key'
}: WeatherServiceProps = {}) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const mockWeatherData: WeatherData = {
    id: '1',
    location: location,
    coordinates: coordinates,
    current: {
      temperature: 72,
      feelsLike: 75,
      humidity: 45,
      windSpeed: 8,
      windDirection: 225,
      visibility: 10,
      pressure: 30.15,
      uvIndex: 6,
      condition: 'Partly Cloudy',
      icon: 'partly-cloudy',
      description: 'Partly cloudy with light winds'
    },
    forecast: [
      {
        date: '2024-01-15',
        day: 'Today',
        high: 75,
        low: 52,
        condition: 'Partly Cloudy',
        icon: 'partly-cloudy',
        precipitation: 10,
        windSpeed: 8,
        humidity: 45
      },
      {
        date: '2024-01-16',
        day: 'Tomorrow',
        high: 78,
        low: 55,
        condition: 'Sunny',
        icon: 'sunny',
        precipitation: 0,
        windSpeed: 6,
        humidity: 40
      },
      {
        date: '2024-01-17',
        day: 'Wednesday',
        high: 68,
        low: 48,
        condition: 'Rain',
        icon: 'rain',
        precipitation: 80,
        windSpeed: 12,
        humidity: 75
      },
      {
        date: '2024-01-18',
        day: 'Thursday',
        high: 65,
        low: 45,
        condition: 'Cloudy',
        icon: 'cloudy',
        precipitation: 20,
        windSpeed: 10,
        humidity: 60
      },
      {
        date: '2024-01-19',
        day: 'Friday',
        high: 70,
        low: 50,
        condition: 'Partly Cloudy',
        icon: 'partly-cloudy',
        precipitation: 5,
        windSpeed: 7,
        humidity: 50
      },
      {
        date: '2024-01-20',
        day: 'Saturday',
        high: 73,
        low: 53,
        condition: 'Sunny',
        icon: 'sunny',
        precipitation: 0,
        windSpeed: 5,
        humidity: 42
      },
      {
        date: '2024-01-21',
        day: 'Sunday',
        high: 76,
        low: 56,
        condition: 'Sunny',
        icon: 'sunny',
        precipitation: 0,
        windSpeed: 4,
        humidity: 38
      }
    ],
    alerts: [
      {
        id: '1',
        title: 'High Wind Warning',
        description: 'Winds 25-35 mph with gusts up to 50 mph expected. Secure loose objects and avoid high-profile vehicles.',
        severity: 'moderate',
        start: '2024-01-17T06:00:00Z',
        end: '2024-01-17T18:00:00Z'
      }
    ],
    lastUpdated: new Date().toISOString()
  }

  useEffect(() => {
    const fetchWeather = async () => {
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

    fetchWeather()
  }, [location, coordinates])

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-6 h-6 text-accent" />
      case 'partly-cloudy':
      case 'partly cloudy':
        return <Cloud className="w-6 h-6 text-mutedForeground" />
      case 'cloudy':
      case 'overcast':
        return <Cloud className="w-6 h-6 text-mutedForeground" />
      case 'rain':
      case 'showers':
        return <CloudRain className="w-6 h-6 text-primary" />
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-primary" />
      case 'thunderstorm':
        return <Zap className="w-6 h-6 text-accent" />
      default:
        return <Sun className="w-6 h-6 text-accent" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-accent/10 border-accent/30 text-accent dark:bg-accent/20 dark:border-accent/40 dark:text-accent'
      case 'moderate':
        return 'bg-accent/20 border-accent/40 text-accent dark:bg-accent/30 dark:border-accent/50 dark:text-accent'
      case 'severe':
        return 'bg-destructive/10 border-destructive/30 text-destructive dark:bg-destructive/20 dark:border-destructive/40 dark:text-destructive'
      case 'extreme':
        return 'bg-destructive/20 border-destructive/40 text-destructive dark:bg-destructive/30 dark:border-destructive/50 dark:text-destructive'
      default:
        return 'bg-muted border-border text-foreground'
    }
  }

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return
    
    setIsSearching(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockCoords = { lat: 39.7392, lon: -104.9903 }
    onLocationSelect(searchLocation, mockCoords)
    setSearchLocation('')
    setIsSearching(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6 animate-pulse">
            <div className="h-8 bg-muted rounded-lg w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded-lg w-1/2"></div>
          </div>
          
          <div className="bg-surface rounded-xl border border-border p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="h-16 bg-muted rounded-lg w-24"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
          
          <div className="bg-surface rounded-xl border border-border p-6 animate-pulse">
            <div className="h-6 bg-muted rounded-lg w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center font-sans">
        <div className="bg-surface rounded-xl border border-border p-8 text-center max-w-md shadow-lg">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Weather Unavailable</h2>
          <p className="text-mutedForeground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
    <div className="min-h-screen bg-background p-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Weather Conditions</h1>
              <div className="flex items-center gap-2 text-mutedForeground">
                <MapPin className="w-4 h-4" />
                <span>{weatherData.location}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search location..."
                className="px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-mutedForeground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 font-sans"
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                aria-label="Search for a location"
              />
              <button
                onClick={handleLocationSearch}
                disabled={isSearching || !searchLocation.trim()}
                className="px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:bg-muted disabled:text-mutedForeground disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Search for location"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {showAlerts && weatherData.alerts.length > 0 && (
          <div className="space-y-3">
            {weatherData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-all duration-300 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{alert.title}</h3>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.start).toLocaleDateString()} - {new Date(alert.end).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weatherData.current.condition)}
              <div>
                <h2 className="text-lg font-semibold text-foreground">{weatherData.current.condition}</h2>
                <p className="text-mutedForeground text-sm">{weatherData.current.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-foreground">{weatherData.current.temperature}°F</div>
              <div className="text-mutedForeground text-sm">Feels like {weatherData.current.feelsLike}°F</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-mutedForeground" />
                <span className="text-mutedForeground text-sm">Wind</span>
              </div>
              <div className="text-foreground font-semibold">{weatherData.current.windSpeed} mph</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-mutedForeground" />
                <span className="text-mutedForeground text-sm">Humidity</span>
              </div>
              <div className="text-foreground font-semibold">{weatherData.current.humidity}%</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-mutedForeground" />
                <span className="text-mutedForeground text-sm">Visibility</span>
              </div>
              <div className="text-foreground font-semibold">{weatherData.current.visibility} mi</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-mutedForeground" />
                <span className="text-mutedForeground text-sm">UV Index</span>
              </div>
              <div className="text-foreground font-semibold">{weatherData.current.uvIndex}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-mutedForeground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last updated: {new Date(weatherData.lastUpdated).toLocaleTimeString()}
          </div>
        </div>

        {showForecast && (
          <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Forecast</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div
                  key={day.date}
                  className={`bg-muted/50 rounded-lg p-4 text-center hover:bg-muted/70 hover:-translate-y-1 transition-all duration-300 ${
                    index === 0 ? 'ring-2 ring-ring/50' : ''
                  }`}
                >
                  <div className="text-foreground font-medium mb-2">{day.day}</div>
                  <div className="flex justify-center mb-3">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div className="text-foreground font-semibold mb-1">{day.high}°</div>
                  <div className="text-mutedForeground text-sm mb-2">{day.low}°</div>
                  <div className="text-xs text-mutedForeground">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Droplets className="w-3 h-3" />
                      {day.precipitation}%
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="w-3 h-3" />
                      {day.windSpeed} mph
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">Off-Road Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 hover:bg-primary/20 transition-all duration-200">
              <h4 className="text-primary font-medium mb-2">Trail Conditions</h4>
              <p className="text-foreground text-sm">
                Current weather is favorable for off-roading. Dry conditions with good visibility.
              </p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 hover:bg-accent/20 transition-all duration-200">
              <h4 className="text-accent font-medium mb-2">Gear Recommendations</h4>
              <p className="text-foreground text-sm">
                Bring extra water, sun protection, and layers for temperature changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WeatherServiceDemo() {
  return (
    <WeatherService
      location="Moab, UT"
      coordinates={{ lat: 38.5733, lon: -109.5498 }}
      showAlerts={true}
      showForecast={true}
    />
  )
}