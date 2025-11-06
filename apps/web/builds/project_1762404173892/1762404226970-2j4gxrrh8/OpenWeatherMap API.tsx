'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Sun, CloudRain, Wind, AlertTriangle } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    humidity: number
    windSpeed: number
    conditions: string
  }
  forecast: Array<{
    date: string
    high: number 
    low: number
    conditions: string
  }>
  alerts?: Array<{
    title: string
    description: string
    severity: 'warning' | 'watch' | 'advisory'
  }>
}

interface WeatherProps {
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
    conditions: 'Partly Cloudy'
  },
  forecast: [
    {
      date: '2024-01-20',
      high: 75,
      low: 55,
      conditions: 'Sunny'
    },
    {
      date: '2024-01-21', 
      high: 70,
      low: 52,
      conditions: 'Partly Cloudy'
    }
  ]
}

export function WeatherDisplay({
  latitude = 40.7128,
  longitude = -74.0060,
  units = 'imperial',
  onError = () => {}
}: WeatherProps = {}) {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch would go here - using mock data for demo
        setWeather(DEFAULT_WEATHER)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data'
        setError(errorMessage)
        onError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude, units, onError])

  const getWeatherIcon = (conditions: string) => {
    switch(conditions.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-[#3B82F6]" aria-hidden="true" />
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-8 h-8 text-[#3B82F6]" aria-hidden="true" />
      case 'rain':
        return <CloudRain className="w-8 h-8 text-[#3B82F6]" aria-hidden="true" />
      default:
        return <Sun className="w-8 h-8 text-[#3B82F6]" aria-hidden="true" />
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-24 space-y-16 animate-pulse">
        <div className="h-32 bg-surface dark:bg-surface rounded-lg"></div>
        <div className="space-y-8">
          <div className="h-24 bg-surface dark:bg-surface rounded-lg"></div>
          <div className="h-24 bg-surface dark:bg-surface rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-24">
        <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
          <div className="flex items-center justify-center gap-8 mb-8">
            <AlertTriangle className="w-16 h-16 text-secondary" />
          </div>
          <p className="text-center text-secondary dark:text-secondary">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto font-['Inter',system-ui,sans-serif]"
    >
      <div className="bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-xl p-24 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-24"
        >
          <div>
            <h2 className="text-2xl font-medium text-muted-foreground dark:text-foreground">
              Current Weather
            </h2>
            <p className="text-4xl font-bold text-muted-foreground dark:text-foreground mt-8">
              {weather.current.temp}°{units === 'imperial' ? 'F' : 'C'}
            </p>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {weather.current.conditions}
            </p>
          </div>
          {getWeatherIcon(weather.current.conditions)}
        </motion.div>

        <div className="grid grid-cols-2 gap-16 mb-24">
          <div className="bg-surface dark:bg-surface/50 p-16 rounded-lg border border-[#E5E7EB] dark:border-border hover:border-[#3B82F6] dark:hover:border-[#3B82F6] transition-colors duration-200">
            <div className="flex items-center gap-8">
              <Wind className="w-20 h-20 text-[#3B82F6]" aria-hidden="true" />
              <span className="text-muted-foreground dark:text-muted-foreground">Wind</span>
            </div>
            <p className="text-muted-foreground dark:text-foreground font-medium mt-8">
              {weather.current.windSpeed} {units === 'imperial' ? 'mph' : 'm/s'}
            </p>
          </div>
          
          <div className="bg-surface dark:bg-surface/50 p-16 rounded-lg border border-[#E5E7EB] dark:border-border hover:border-[#3B82F6] dark:hover:border-[#3B82F6] transition-colors duration-200">
            <div className="flex items-center gap-8">
              <Cloud className="w-20 h-20 text-[#3B82F6]" aria-hidden="true" />
              <span className="text-muted-foreground dark:text-muted-foreground">Humidity</span>
            </div>
            <p className="text-muted-foreground dark:text-foreground font-medium mt-8">
              {weather.current.humidity}%
            </p>
          </div>
        </div>

        <div className="space-y-16">
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">7-Day Forecast</h3>
          
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {weather.forecast.map((day) => (
              <motion.div
                key={day.date}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
                className="flex items-center justify-between p-16 bg-surface dark:bg-surface/50 rounded-lg border border-[#E5E7EB] dark:border-border hover:border-[#3B82F6] dark:hover:border-[#3B82F6] transition-all duration-200 hover:-translate-y-2"
              >
                <div className="flex items-center gap-12">
                  {getWeatherIcon(day.conditions)}
                  <div>
                    <p className="text-muted-foreground dark:text-foreground font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                      {day.conditions}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground dark:text-foreground font-medium">
                    {day.high}° <span className="text-muted-foreground dark:text-muted-foreground">/ {day.low}°</span>
                  </p>
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
              className="mt-24"
            >
              <div className="bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary rounded-lg p-16">
                <div className="flex items-center gap-8 text-secondary dark:text-secondary">
                  <AlertTriangle className="w-20 h-20" aria-hidden="true" />
                  <h3 className="font-medium">Weather Alerts</h3>
                </div>
                {weather.alerts.map((alert, i) => (
                  <div key={i} className="mt-8 text-secondary dark:text-secondary text-sm">
                    <p className="font-medium">{alert.title}</p>
                    <p>{alert.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function WeatherDemo() {
  return <WeatherDisplay />
}