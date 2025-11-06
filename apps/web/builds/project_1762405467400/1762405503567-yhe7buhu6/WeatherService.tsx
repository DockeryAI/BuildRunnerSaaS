'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, Wind, AlertTriangle, Loader2 } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    conditions: string
    windSpeed: number
    precipitation: number
  }
  forecast: Array<{
    date: string
    high: number
    low: number
    conditions: string
  }>
  alerts?: Array<{
    type: string
    description: string
    severity: 'minor' | 'moderate' | 'severe'
  }>
}

interface WeatherServiceProps {
  latitude?: number
  longitude?: number
  onWeatherUpdate?: (data: WeatherData) => void
}

const defaultWeather: WeatherData = {
  current: {
    temp: 72,
    conditions: 'Partly Cloudy',
    windSpeed: 5,
    precipitation: 0
  },
  forecast: [
    {
      date: '2024-01-20',
      high: 75,
      low: 65,
      conditions: 'Sunny'
    },
    {
      date: '2024-01-21', 
      high: 73,
      low: 62,
      conditions: 'Partly Cloudy'
    },
    {
      date: '2024-01-22',
      high: 68,
      low: 58,
      conditions: 'Rain'
    }
  ],
  alerts: [
    {
      type: 'Wind Advisory',
      description: 'Strong winds expected',
      severity: 'moderate'
    }
  ]
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
}

export function WeatherService({
  latitude = 34.0522,
  longitude = -118.2437,
  onWeatherUpdate = () => {}
}: WeatherServiceProps) {
  const [weather, setWeather] = useState<WeatherData>(defaultWeather)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setWeather(defaultWeather)
        onWeatherUpdate(defaultWeather)
      } catch (error) {
        setError('Failed to fetch weather data. Please try again.')
        console.error('Failed to fetch weather:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude, onWeatherUpdate])

  const getWeatherIcon = (conditions: string) => {
    switch(conditions.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-[#3B82F6]" aria-hidden="true" />
      case 'rain':
        return <CloudRain className="w-6 h-6 text-[#3B82F6]" aria-hidden="true" />
      default:
        return <Cloud className="w-6 h-6 text-[#3B82F6]" aria-hidden="true" />
    }
  }

  if (loading) {
    return (
      <motion.div 
        className="p-24 bg-background dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="alert"
        aria-label="Loading weather data"
      >
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
        <p className="text-sm text-secondary dark:text-secondary text-center">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-background dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border p-24 space-y-24 transition-all duration-300 hover:shadow-lg"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-medium text-muted-foreground dark:text-foreground font-inter">
            Current Weather
          </h2>
          <p className="text-muted-foreground dark:text-muted-foreground">
            {weather.current.temp}°F • {weather.current.conditions}
          </p>
        </div>
        {getWeatherIcon(weather.current.conditions)}
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-16 text-muted-foreground dark:text-muted-foreground">
          <div className="flex items-center gap-8">
            <Wind className="w-4 h-4" aria-hidden="true" />
            <span>{weather.current.windSpeed} mph</span>
          </div>
          <div className="flex items-center gap-8">
            <CloudRain className="w-4 h-4" aria-hidden="true" />
            <span>{weather.current.precipitation}%</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-16">
        <h3 className="font-medium text-muted-foreground dark:text-foreground font-inter">7-Day Forecast</h3>
        <div className="grid gap-8">
          {weather.forecast.map((day) => (
            <motion.div
              key={day.date}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-16 bg-surface dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border transition-all duration-200"
            >
              <div className="flex items-center gap-16">
                {getWeatherIcon(day.conditions)}
                <span className="text-muted-foreground dark:text-foreground">{new Date(day.date).toLocaleDateString()}</span>
              </div>
              <div className="text-muted-foreground dark:text-muted-foreground">
                {day.high}° / {day.low}°
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {weather.alerts && weather.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-8"
          >
            {weather.alerts.map((alert, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-8 p-16 bg-surface dark:bg-surface border-l-4 border-l-[#3B82F6] border border-[#E5E7EB] dark:border-border rounded-lg"
                role="alert"
              >
                <AlertTriangle className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-2" aria-hidden="true" />
                <div>
                  <h4 className="font-medium text-muted-foreground dark:text-foreground">{alert.type}</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{alert.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function WeatherServiceDemo() {
  return (
    <div className="max-w-3xl mx-auto p-16">
      <WeatherService />
    </div>
  )
}