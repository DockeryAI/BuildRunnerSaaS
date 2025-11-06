'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudRain, CloudSnow, Sun, Wind, AlertTriangle } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    conditions: string
    icon: string
    alerts?: string[]
  }
  forecast: Array<{
    day: string
    high: number 
    low: number
    conditions: string
    icon: string
  }>
}

interface WeatherIntegrationProps {
  latitude?: number
  longitude?: number
  onWeatherAlert?: (alert: string) => void
}

const DEFAULT_WEATHER: WeatherData = {
  current: {
    temp: 72,
    conditions: "Partly Cloudy",
    icon: "cloud",
    alerts: []
  },
  forecast: [
    {day: "Mon", high: 75, low: 65, conditions: "Sunny", icon: "sun"},
    {day: "Tue", high: 72, low: 62, conditions: "Cloudy", icon: "cloud"},
    {day: "Wed", high: 68, low: 58, conditions: "Rain", icon: "rain"},
    {day: "Thu", high: 70, low: 60, conditions: "Partly Cloudy", icon: "cloud"},
    {day: "Fri", high: 73, low: 63, conditions: "Sunny", icon: "sun"},
    {day: "Sat", high: 71, low: 61, conditions: "Rain", icon: "rain"},
    {day: "Sun", high: 69, low: 59, conditions: "Cloudy", icon: "cloud"}
  ]
}

export function WeatherIntegration({
  latitude = 40.7128,
  longitude = -74.0060,
  onWeatherAlert = () => {}
}: WeatherIntegrationProps) {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setWeather(DEFAULT_WEATHER)
      } catch (error) {
        setError('Failed to fetch weather data')
        console.error('Error fetching weather:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude])

  const getWeatherIcon = (condition: string) => {
    const iconProps = "w-6 h-6 transition-transform duration-300"
    switch(condition.toLowerCase()) {
      case 'rain': return <CloudRain className={iconProps} aria-label="Rain" />
      case 'snow': return <CloudSnow className={iconProps} aria-label="Snow" />
      case 'cloudy': return <Cloud className={iconProps} aria-label="Cloudy" />
      case 'windy': return <Wind className={iconProps} aria-label="Windy" />
      default: return <Sun className={iconProps} aria-label="Sunny" />
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-muted dark:bg-gray-700 rounded-md w-3/4"></div>
        <div className="h-24 bg-muted dark:bg-gray-700 rounded-lg"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-muted dark:bg-gray-700 rounded-md"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto font-sans"
    >
      <div className="bg-[#F8F7F4] dark:bg-[#1A1D1A] rounded-lg shadow-lg p-6 space-y-6 transition-all duration-300 hover:shadow-xl">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <motion.div 
          className="flex items-center justify-between"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div>
            <h2 className="text-2xl font-semibold text-primary">
              Current Weather
            </h2>
            <p className="text-lg text-mutedForeground">
              {weather.current.temp}°F • {weather.current.conditions}
            </p>
          </div>
          <motion.div
            whileHover={{ rotate: 5 }}
            className="text-primary"
          >
            {getWeatherIcon(weather.current.conditions)}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {weather.current.alerts?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 border border-destructive rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Weather Alert</span>
              </div>
              <ul className="mt-2 space-y-1">
                {weather.current.alerts.map((alert, i) => (
                  <li key={i} className="text-destructive text-sm">
                    {alert}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-7 gap-2"
        >
          {weather.forecast.map((day, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, scale: 1.05 }}
              className="flex flex-col items-center p-2 rounded-lg bg-surface dark:bg-surface-dark transition-all duration-300"
            >
              <span className="text-sm font-medium text-mutedForeground">
                {day.day}
              </span>
              <div className="my-2 text-primary">
                {getWeatherIcon(day.conditions)}
              </div>
              <span className="text-xs font-medium text-foreground dark:text-foreground-dark">
                {day.high}°
              </span>
              <span className="text-xs text-mutedForeground">
                {day.low}°
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function WeatherIntegrationDemo() {
  return <WeatherIntegration />
}