'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalendarViewProps {
  initialDate?: Date
  onDateSelect?: (date: Date) => void
}

export function CalendarView({
  initialDate = new Date(),
  onDateSelect = () => {}
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [direction, setDirection] = useState(0) // 0 for initial, 1 for next, -1 for previous

  const daysInMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }, [])

  const firstDayOfMonth = useCallback((date: Date) => {
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }, [])

  const handlePreviousMonth = useCallback(() => {
    setDirection(-1)
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setDirection(1)
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))
  }, [])

  const renderDays = useMemo(() => {
    const totalDays = daysInMonth(currentDate)
    const firstDay = firstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" aria-hidden="true" />)
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = initialDate && date.toDateString() === initialDate.toDateString(); // Example for selected date

      days.push(
        <motion.button
          key={i}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDateSelect(date)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-inter font-medium transition-colors duration-200
            ${isToday
              ? 'bg-[#3B82F6] text-foreground'
              : isSelected
                ? 'bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30'
                : 'text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
            }
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`Select ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        >
          {i}
        </motion.button>
      )
    }

    return days
  }, [currentDate, daysInMonth, firstDayOfMonth, onDateSelect, initialDate])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-background dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border p-6 font-inter shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePreviousMonth}
          className="p-2 rounded-full hover:bg-surface dark:hover:bg-surface transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
        </motion.button>
        
        <h2 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-surface dark:hover:bg-surface transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-center text-muted-foreground dark:text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentDate.getMonth() + currentDate.getFullYear() * 100}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="grid grid-cols-7 gap-2"
        >
          {renderDays}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default function CalendarViewDemo() {
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date.toLocaleDateString());
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-surface dark:bg-surface p-8">
      <CalendarView onDateSelect={handleDateSelect} />
    </div>
  );
}