'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Flame, TrendingUp } from 'lucide-react'

interface CalorieData {
  date: string
  calories: number
  goal: number
}

interface CalorieStatsProps {
  data?: CalorieData[]
  onDateSelect?: (date: string) => void
  isLoading?: boolean
  error?: string | null
}

export function CalorieStats({
  data = DEFAULT_DATA,
  onDateSelect = () => {},
  isLoading = false,
  error = null,
}: CalorieStatsProps) {
  const [selectedDate, setSelectedDate] = useState<string>(data[0]?.date || '')

  // Update selectedDate if data changes and current selectedDate is no longer valid
  // Or if data is loaded for the first time
  useState(() => {
    if (data.length > 0 && !data.some(d => d.date === selectedDate)) {
      setSelectedDate(data[0].date);
    }
  }, [data, selectedDate]);

  const selectedData = data.find((d) => d.date === selectedDate) || data[0] || null

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    onDateSelect(date)
  }

  if (isLoading) {
    return (
      <div className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-surface dark:bg-surface rounded w-1/3"></div>
          <div className="h-6 bg-surface dark:bg-surface rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface dark:bg-surface rounded-lg p-4 h-28"></div>
          <div className="bg-surface dark:bg-surface rounded-lg p-4 h-28"></div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-surface dark:bg-surface rounded-full shrink-0"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-6 text-center">
        <p className="text-sm text-destructive dark:text-destructive">Error loading calorie data: {error}</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">No calorie data available</h3>
        <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start tracking your calories to see your progress here.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 space-y-24 font-inter"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground dark:text-foreground text-lg font-medium">Calorie Overview</h2>
        <div className="flex items-center gap-8">
          <Calendar className="h-20 w-20 text-muted-foreground dark:text-muted-foreground" />
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">{selectedData?.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-16">
        <motion.div
          whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
          transition={{ duration: 0.2 }}
          className="bg-surface dark:bg-surface rounded-lg border border-border dark:border-border p-16 cursor-pointer"
        >
          <div className="flex items-center gap-8">
            <Flame className="h-20 w-20 text-accent" /> {/* Accent color */}
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">Consumed</span>
          </div>
          <p className="text-muted-foreground dark:text-foreground text-32 font-medium mt-8">
            {selectedData?.calories} kcal
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
          transition={{ duration: 0.2 }}
          className="bg-surface dark:bg-surface rounded-lg border border-border dark:border-border p-16 cursor-pointer"
        >
          <div className="flex items-center gap-8">
            <TrendingUp className="h-20 w-20 text-[#3B82F6]" /> {/* Primary color */}
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">Goal</span>
          </div>
          <p className="text-muted-foreground dark:text-foreground text-32 font-medium mt-8">
            {selectedData?.goal} kcal
          </p>
        </motion.div>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
        {data.map((item) => (
          <motion.button
            key={item.date}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDateSelect(item.date)}
            className={`shrink-0 px-16 py-8 rounded-full text-sm font-medium transition-all duration-150 ease-in-out
              ${
                selectedDate === item.date
                  ? 'bg-[#3B82F6] text-foreground shadow-md'
                  : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
              }
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800
            `}
            aria-label={`Select date ${item.date}`}
          >
            {item.date}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

const DEFAULT_DATA: CalorieData[] = [
  { date: '2023-10-01', calories: 1800, goal: 2000 },
  { date: '2023-10-02', calories: 2200, goal: 2000 },
  { date: '2023-10-03', calories: 1900, goal: 2000 },
  { date: '2023-10-04', calories: 2100, goal: 2000 },
  { date: '2023-10-05', calories: 2000, goal: 2000 },
  { date: '2023-10-06', calories: 1750, goal: 2000 },
  { date: '2023-10-07', calories: 2300, goal: 2000 },
]

export default function CalorieStatsDemo() {
  return <CalorieStats />
}