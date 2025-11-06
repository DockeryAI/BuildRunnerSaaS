'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudRain, Sun, Wind, AlertTriangle } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    humidity: number
    windSpeed: number
    conditions: string
  }
  daily: Array<{
    date: string
    high: number
    low: number
    conditions: string
  }>
  alerts?: Array<{
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe'
  }>
}

interface WeatherDisplayProps {
  latitude?: number
  longitude?: number
  units?: 'imperial' | 'metric'
  onError?: (error: Error) => void
}

const DEFAULT_WEATHER: WeatherData = {
  current: {
    temp: 72,
    humidity: 45,
    windSpeed: 8,
    conditions: 'Clear'
  },
  daily: [
    {date: '2024-01-20', high: 75, low: 55, conditions: 'Sunny'},
    {date: '2024-01-21', high: 70, low: 52, conditions: 'Partly Cloudy'},
    {date: '2024-01-22', high: 68, low: 50, conditions: 'Rain'},
    {date: '2024-01-23', high: 65, low: 48, conditions: 'Cloudy'},
    {date: '2024-01-24', high: 70, low: 52, conditions: 'Clear'},
  ],
  alerts: [
    {
      title: 'Flash Flood Watch',
      description: 'Heavy rainfall may cause flooding in low-lying areas',
      severity: 'moderate'
    }
  ]
}

export function WeatherDisplay({
  latitude = 40.7128,
  longitude = -74.0060,
  units = 'imperial',
  onError = () => {}
}: WeatherDisplayProps) {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setWeather(DEFAULT_WEATHER)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data'
        setError(errorMessage)
        onError(error as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude, units, onError])

  const getWeatherIcon = (conditions: string) => {
    switch(conditions.toLowerCase()) {
      case 'rain':
        return <CloudRain className="w-6 h-6" />
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-6 h-6" />
      default:
        return <Sun className="w-6 h-6" />
    }
  }

  if (loading) {
    return (
      <motion.div 
        className="animate-pulse bg-muted rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-8 bg-border rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-border rounded mb-4"></div>
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-6 bg-border rounded"></div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface dark:bg-surface-dark rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Current Weather</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.current.conditions)}
            <span className="text-4xl font-bold text-foreground dark:text-foreground-dark">
              {weather.current.temp}°
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span className="text-foreground dark:text-foreground-dark">
                {weather.current.windSpeed} mph
              </span>
            </div>
            <div className="text-mutedForeground">
              Humidity: {weather.current.humidity}%
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">5-Day Forecast</h3>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 }}
          }}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {weather.daily.map((day) => (
            <motion.div
              key={day.date}
              variants={{
                hidden: { opacity: 0, x: -20 },
                show: { opacity: 1, x: 0 }
              }}
              whileHover={{ x: 4, backgroundColor: 'rgba(45, 90, 39, 0.05)' }}
              className="flex items-center justify-between p-3 bg-muted rounded-md transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                {getWeatherIcon(day.conditions)}
                <span className="text-foreground dark:text-foreground-dark">
                  {new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-foreground dark:text-foreground-dark">
                  {day.high}°
                </span>
                <span className="text-mutedForeground">
                  {day.low}°
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {weather.alerts && weather.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-4"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Weather Alerts
            </h3>
            {weather.alerts.map((alert, index) => (
              <div 
                key={index}
                className="p-4 bg-accent/10 rounded-md mb-3 last:mb-0"
              >
                <h4 className="font-semibold text-accent mb-1">{alert.title}</h4>
                <p className="text-sm text-foreground dark:text-foreground-dark">
                  {alert.description}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function WeatherDemo() {
  return <WeatherDisplay />
}